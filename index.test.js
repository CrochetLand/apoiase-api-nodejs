const Apoiase = require('./index');

const username = process.env.APOIASE_USERNAME, password = process.env.APOIASE_PASSWORD;


describe("Isolated login", () => {

    const apoiase = new Apoiase();

    it('Test environment is set', () => {

        expect(username).not.toBeUndefined();
        expect(password).not.toBeUndefined();
    });


    it('Should login', async () => {

        await apoiase.login(username, password);
        expect(apoiase.authenticated).toBeTruthy();
    });

    it('Should get me', async () => {
        expect(apoiase.me).not.toBeUndefined();
    });

});


describe('Api tests', () => {
    let apoiase;
    beforeAll(async () => {
        apoiase = new Apoiase({verbose: true});
        await apoiase.login(username, password);
    });

    it('Should download backers', async () => {

        expect(apoiase.authenticated).toBeTruthy();


        const backers = await apoiase.backers();
        expect(backers).not.toBeUndefined();
        expect(Array.isArray(backers.backers)).toBeTruthy();


    });

    it('Should download backers csv', async () => {

        expect(apoiase.authenticated).toBeTruthy();


        const backersCSV = await apoiase.backersCSV();
        expect(backersCSV).not.toBeUndefined();
        expect(typeof backersCSV).not.toBe('string');


    });
    it('Should load charges for the current month', async () => {

        expect(apoiase.authenticated).toBeTruthy();


        const charges = await apoiase.charges();
        expect(charges).not.toBeUndefined();
        expect(charges.amountCharged).not.toBeUndefined();


    });
    it('Should load CSV charges for the current month', async () => {

        expect(apoiase.authenticated).toBeTruthy();


        const chargesCSV = await apoiase.chargesCSV();

        expect(chargesCSV).not.toBeUndefined();
        expect(typeof chargesCSV).not.toBe('string');
    });

    it('Should load payouts', async () => {

        expect(apoiase.authenticated).toBeTruthy();


        const payouts = await apoiase.payouts();
        expect(payouts.currentMonthInfos).not.toBeUndefined();
        expect(payouts.transferences).not.toBeUndefined();


    });

});