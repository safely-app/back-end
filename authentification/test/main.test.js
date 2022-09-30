require('./../app.js');
const assert = require('chai').assert;
const expect = require('chai').expect;
const {generateToken, sendResetPasswordEmail} = require('./../store/utils');
const {ResetPassword} = require ("./../database/models");

describe('Test Utils', () => {

  it('Test token generation',  async function ()  {
    const token = await generateToken();

    assert.equal(token.length, 60);
  })

  it('Check the sending of the reset password email', async function() {
    await ResetPassword.insertMany([
      {userId: "5fdedb7c25ab1352eef88f60", resetPasswordToken: await generateToken(), expire: Date()}
    ]);

    const resetPassword = await ResetPassword.findOne();

    expect(resetPassword).to.exist;
    if (resetPassword) {
      const email = await sendResetPasswordEmail({email: 'test@email.com'}, resetPassword.resetPasswordToken)
      assert.equal(email.status, 200);
    }
  })
})
