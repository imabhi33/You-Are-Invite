export function formatDate(dateInput) {
  if (!dateInput) return "Select date";
  return new Date(dateInput).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function parseTargetDate(targetDate) {
  if (!targetDate) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return new Date(`${targetDate}T23:59:59`);
  return new Date(targetDate);
}