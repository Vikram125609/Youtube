const getUrl = () => {
    const options = {
        redirect_uri: 'http://localhost:3000/api/v1/general/redirect',
        client_id: 'PASTE YOUR CLIENT ID OVER HERE',
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
    }
    return `https://accounts.google.com/o/oauth2/auth?client_id=${options?.client_id}&redirect_uri=${options?.redirect_uri}&response_type=code&scope=${options?.scope}&access_type=${options?.access_type}`
};