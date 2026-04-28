const passport = require("passport");
const lnurlAuth = require("passport-lnurl-auth");
const session = require("express-session");
const { HttpError, verifyAuthorizationSignature } = require("lnurl/lib");
const assert = require("assert");
const crypto = require("crypto");
const lnurl = require("lnurl");
const qrcode = require("qrcode");

const map = {
  user: new Map(),
  session: new Map(),
};

function setupAuth(app) {
  // We'll use a simple memory store but keep a reference to it
  const sessionStore = new session.MemoryStore();

  app.use(
    session({
      secret: "lightning-app-session-secret",
      resave: true, // Force resave to ensure session is updated
      saveUninitialized: true,
      store: sessionStore,
      cookie: { secure: false }
    })
  );

  passport.use(
    new lnurlAuth.Strategy(function (linkingPublicKey, done) {
      let user = map.user.get(linkingPublicKey);
      if (!user) {
        user = { id: linkingPublicKey };
        map.user.set(linkingPublicKey, user);
      }
      done(null, user);
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    done(null, map.user.get(id) || null);
  });
  
  app.get(
    "/do-login",
    async function (req, res, next) {
      if (req.query.k1 || req.query.key || req.query.sig) {
        try {
          const { k1, sig, key } = req.query;
          const sessionID = map.session.get(k1);
          
          if (!sessionID) {
            throw new HttpError("Secret does not match any known session", 400);
          }

          if (!verifyAuthorizationSignature(sig, k1, key)) {
            throw new HttpError("Invalid signature", 400);
          }
          
          // Get the session from the store
          sessionStore.get(sessionID, (err, browserSession) => {
              if (err || !browserSession) return;
              
              // Manually inject the passport user into the browser's session
              browserSession.passport = { user: key };
              
              // Save it back to the store
              sessionStore.set(sessionID, browserSession, (err) => {
                  if (err) console.error("Error saving session:", err);
                  else console.log(`✅ Session ${sessionID} updated for user ${key.substring(0,10)}`);
              });
          });

          if (!map.user.has(key)) {
            map.user.set(key, { id: key });
          }
          
          return res.status(200).json({ status: "OK" });
        } catch (e) {
          console.error("LNURL-Auth Callback Error:", e.message);
          return res.status(e.status || 500).json({ status: "ERROR", reason: e.message });
        }
      }
      
      // Store the session ID instead of the session object
      let k1 = req.session.lnurlAuth?.k1;
      if (!k1) {
        k1 = crypto.randomBytes(32).toString("hex");
        req.session.lnurlAuth = { k1 };
        map.session.set(k1, req.sessionID);
      }

      const params = new URLSearchParams({ k1, tag: "login" });
      const callbackUrl = `https://${req.get("host")}/do-login?${params.toString()}`;
      const encoded = lnurl.encode(callbackUrl).toUpperCase();
      const qrCode = await qrcode.toDataURL(encoded);

      return res.json({
        lnurl: encoded,
        qrCode: qrCode,
      });
    }
  );

  app.get("/logout", function (req, res) {
    req.session.destroy();
    return res.redirect("/");
  });

  app.get("/me", function (req, res) {
    // Log for debugging
    if (req.user) {
        console.log(`🔍 /me: User found: ${req.user.id.substring(0,10)}`);
    }
    res.json({ user: req.user ? req.user : null });
  });

  app.get("/profile", function (req, res) {
    if (!req.user) return res.redirect("/");
    res.render("profile", { user: req.user });
  });
}

module.exports = { setupAuth };
