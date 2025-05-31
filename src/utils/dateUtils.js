/**
 * @module utils/dateUtils
 * @description Utility functions for date manipulation and formatting
 */

/**
 * Formats a date into a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., '2023-05-31 14:30:00')
 */
const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');
};

module.exports = {
    formatDate
};
