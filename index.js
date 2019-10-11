const axios = require('axios');
const qs = require("qs");
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const {Cookie, CookieJar} = require("tough-cookie");
const csvParser = require('csv-parse/lib/sync');

class Apoiase {


    constructor(options) {
        this.options = Object.assign({verbose: false}, options);

        this._cookieJar = new CookieJar();

        this._loginApi = axios.create({
            baseURL: 'https://apoia.se',
            timeout: this.options.timeout || 5000,
            jar: this._cookieJar,
            withCredentials: true
        });

        axiosCookieJarSupport(this._loginApi);
    }

    get dashboardApi() {
        return axios.create({
            baseURL: 'https://dashboard-api-v1.apoia.se',
            timeout: 5000,
            jar: this._cookieJar,
            withCredentials: true,
            headers: {'Authorization': `Bearer ${this._dashboardToken}`}
        });
    }

    get loginApi() {
        return this._loginApi;
    }

    get me() {
        return this._me;
    }

    get authenticated() {
        return !!this._me && !!this._dashboardToken;
    }

    get defaultCampaign() {
        return this.me.campaigns[0]._id;
    }


    async login(user, password) {

        const response = await this._loginApi.post("/api/v1/auth/local", {
            "email": user,
            "password": password,
            "reCaptchaToken": null,
            "reCaptchaPage": "login",
            "apoiaseLogin": false
        });

        this._logResponse(response);

        this._me = response.data;
        if (this.options.verbose) {
            console.log('Logged in');
        }

        const {_id, username, name, sso, admin} = this._me;
        const currentUser = {_id, username, name, email: user, sso, admin};

        const currentUserCookie = new Cookie();
        currentUserCookie.domain = '.apoia.se';
        currentUserCookie.key = 'currentUser';
        currentUserCookie.value = encodeURIComponent(JSON.stringify(currentUser));
        currentUserCookie.path = '/';


        await this.authorizeDashboard();

    }

    _checkAuthenticated() {
        if (!this.authenticated) {
            throw new Error("Unauthenticated, please do login() first");
        }
    }

    _logResponse(response) {
        if (this.options.verbose) {
            console.log(`${response.request.path} ${response.status}`)
        }
    }

    _parseCsvFromResponse(response) {
        const csvData = csvParser(response.data.trim(), {
            quote: '"',
        });


        if (this.options.verbose) {
            console.log(`CSV returned ${csvData.length} rows`);
        }

        return csvData;
    }


    async authorizeDashboard() {
        try {
            const response = await this._loginApi
                .get(`/${this.me.username}/dashboard`,
                    {
                        headers: {'authority': 'apoia.se'},
                        maxRedirects: 0
                    },
                );
            this._logResponse(response)
        } catch (error) {
            this._logResponse(error.response);
            if (error.response && error.response.headers.location) {
                const url = error.response.headers.location;
                const fragment = url.split('#')[1];
                const token = qs.parse(fragment.split('?')[1]).token;
                this._dashboardToken = token;
                if (this.options.verbose) {
                    console.log('Dashboard Authorized');
                }
            } else {
                throw error;
            }
        }
    }

    async backers() {
        this._checkAuthenticated();
        const response = await this.dashboardApi.get(`/api/reports/backers/${this.defaultCampaign}`);
        this._logResponse(response);
        return response.data;
    }


    async backersCSV() {
        this._checkAuthenticated();
        const response = await this.dashboardApi.get(`/api/reports/backers/csv/${this.defaultCampaign}`);
        this._logResponse(response);
        return this._parseCsvFromResponse(response);


    }

    async charges(date) {
        this._checkAuthenticated();
        date = date || new Date();
        const response = await this.dashboardApi.get(`/api/reports/charges/${this.defaultCampaign}/${date.getFullYear()}-${date.getMonth() + 1}`);
        this._logResponse(response);
        return response.data;
    }

    async chargesCSV(date) {
        this._checkAuthenticated();
        date = date || new Date();
        const response = await this.dashboardApi.get(`/api/reports/charges/csv/${this.defaultCampaign}/${date.getFullYear()}-${date.getMonth() + 1}`);
        this._logResponse(response);
        return this._parseCsvFromResponse(response);
    }


    async payouts() {
        this._checkAuthenticated();
        const response = await this.dashboardApi.get(`/api/reports/transferences/${this.defaultCampaign}`);
        this._logResponse(response);
        return response.data;
    }

}


module.exports = Apoiase;