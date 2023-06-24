module.exports = {
    isEmpty,
    removeNonStandardChars,
    formatDate
}





function isEmpty(any) {
    return any === null || any === undefined || any === '';
}



function removeNonStandardChars(str) {
    const regex = /[^a-zA-Z0-9-_ ]/g;
    return str.replace(regex, '');
}



function formatDate(timestamp) {
    if (!timestamp) timestamp = Date.now();

    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedTimestamp = `${day}-${month}-${year}_${hours}_${minutes}_${seconds}`;

    return formattedTimestamp;
}
