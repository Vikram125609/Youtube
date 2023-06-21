const redirect = catchAsync(async (req, res, next) => {
    const { code } = req.query;

    const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT}&grant_type=authorization_code&scope=${process.env.SCOPE}`;

    const response = await axios.post(url, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const { access_token } = response?.data;

    const listMessageUrl = `https://gmail.googleapis.com/gmail/v1/users/${process.env.EMAIL}/messages?key=${process.env.API_KEY}&q=label%3Ainbox+label%3Aunread`;

    const listMessageApi = await axios.get(listMessageUrl, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        }
    });

    console.log('Total unread emails ' + listMessageApi?.data?.messages?.length);

    const messageId_threadId = listMessageApi?.data?.messages;

    const recursiveCallForGoogleGmailApi = async (getMessageUrl, id, count) => {
        if (count === 0) {
            console.log('Google Reached till zero');
            return undefined;
        }
        try {
            return await axios.get(getMessageUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                timeout: 10000
            });
        } catch (error) {
            return recursiveCallForGoogleGmailApi(id, count - 1);
        }
    };

    const unreadlMessageApiPromise = messageId_threadId?.map(async (data) => {
        const getMessageUrl = `https://gmail.googleapis.com/gmail/v1/users/amgrowth.ai@gmail.com/messages/${data.id}?key=${process.env.API_KEY}`;
        try {
            return await axios.get(getMessageUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                timeout: 10000
            });
        } catch (error) {
            return recursiveCallForGoogleGmailApi(getMessageUrl, data?.id, 10);
        }
    })

    const unreadMessageApiResponse = await Promise.all(unreadlMessageApiPromise);

    const allMessages = unreadMessageApiResponse?.map((data) => {
        if (data?.data?.payload?.parts?.length > 0) {
            if (data?.data?.payload?.parts?.length === 1) {
                if (data?.data?.payload?.parts[0]?.mimeType === 'text/plain') {
                    if (data?.data?.payload?.parts[0]?.body) {
                        if (data?.data?.payload?.parts[0]?.body?.data) {
                            return { data: data?.data?.payload?.parts[0]?.body?.data, id: data?.data?.id };
                        }
                    }
                }
            }
            if (data?.data?.payload?.parts?.length === 2) {
                if (data?.data?.payload?.parts[0]?.mimeType === 'text/plain') {
                    if (data?.data?.payload?.parts[0]?.body) {
                        if (data?.data?.payload?.parts[0]?.body?.data) {
                            return { data: data?.data?.payload?.parts[0]?.body?.data, id: data?.data?.id };
                        }
                    }
                }
                if (data?.data?.payload?.parts[1]?.mimeType === 'text/plain') {
                    if (data?.data?.payload?.parts[1]?.body) {
                        if (data?.data?.payload?.parts[1]?.body?.data) {
                            return { data: data?.data?.payload?.parts[1]?.body?.data, id: data?.data?.id };
                        }
                    }
                }
            }
        }
        return undefined;
    });
    const decodedMessage = allMessages?.filter((data) => {
        if (data !== undefined) {
            return data;
        }
    });
    res.redirect('http://localhost:3001');
});

module.exports = { redirect };