
const api = 'http://localhost:3000/api/footer';

(async () => {
    try {
        console.log('Fetching footer config...');
        const res = await fetch(api);
        const wrapper = await res.json();
        let config = wrapper.data;

        if (!config) {
            console.error('No config found');
            return;
        }

        if (!config.contact) config.contact = {};

        // Force update or add if missing
        if (!config.contact.email) {
            console.log('Email field missing or empty. Updating to contact@melzo.com...');
            config.contact.email = 'contact@melzo.com';

            const updateRes = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const updateData = await updateRes.json();
            console.log('Update result:', updateData);
        } else {
            console.log('Email already present:', config.contact.email);
        }

    } catch (e) {
        console.error('Error:', e);
    }
})();
