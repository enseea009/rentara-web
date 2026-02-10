// Booking related functions

function calculateTotal(days, pricePerDay) {
    return days * pricePerDay;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}
