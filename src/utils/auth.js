export const getToken = () => {
  return localStorage.getItem('agriconnect_token') || 
         sessionStorage.getItem('agriconnect_token') || 
         localStorage.getItem('token') || 
         sessionStorage.getItem('token');
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('agriconnect_user') || 
                    sessionStorage.getItem('agriconnect_user') || 
                    localStorage.getItem('user') || 
                    sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};
