export const BASE_URL = 'https://localhost:8000';

export const API_PATHS = {
    AUTH:{
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        GET_PROFILE: '/api/auth/profile',
    },
    IMAGE:{
        UPLOAD_IMAGE: '/api/images/upload-image',
    },
    AI:{
        GENERAATE_QUESTIONS: '/api/ai/generate-questions',
        GENERAATE_EXPLANATION: '/api/ai/generate-explanation',
    },
    SESSION: {
        CREATE : '/api/sessions/create',
        GET_ALL : '/api/sessions/my-sessions',
        GET_ONE : (id) => `/api/sessions/${id}`,
        DELETE : (id) => `/api/sessions/${id}`,
    },
    QUESTION: {
        ADD_TO_SESSION : "/api/questions/add",
        PIN : (id) => `/api/questions/${id}/pin`,
        UPDATE_NOTE : (id) => `/api/questions/${id}/note`,
    },
};