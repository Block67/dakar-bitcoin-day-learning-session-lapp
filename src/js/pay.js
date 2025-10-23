let paymentActive = false;

async function fetchInvoice(amount, comment) {
    const response = await fetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({ amount, comment }),
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Failed to fetch invoice");
    return response.json();
}

async function payWithCheckout(amount, comment) {
    if (paymentActive) return;
    paymentActive = true;

    try {
        const invoiceData = await fetchInvoice(amount, comment);
        
        window.open(invoiceData.checkoutLink, '_blank');

    } catch (err) {
        console.error("Checkout error:", err);
        alert("Error: " + err.message);
    } finally {
        paymentActive = false;
    }
}