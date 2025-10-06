// Email validation function
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // ✅ Removed extra spaces
  return regex.test(email);
};

// Get initials function
export const getInitials = (title) => {  // ✅ Arrow function syntax fixed
  if (!title) return "";
  const words = title.split(" ");
  let initials = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};
