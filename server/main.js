import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  const smtp = Meteor.settings.mailCredentials.smtp;

  process.env.MAIL_URL =
    'smtps://' +
    encodeURIComponent(smtp.userName) +
    ':' +
    smtp.password +
    '@' +
    smtp.host +
    ':' +
    smtp.port;
  Accounts.emailTemplates.resetPassword.from = () => smtp.fromEmail;
  Accounts.emailTemplates.from = () => smtp.fromEmail;
  Accounts.emailTemplates.resetPassword.text = function (user, url) {
    url = url.replace('#/', '');
    return `To reset your password, simply click the link below. ${url}`;
  };

  Meteor.users.find().forEach((user) => {
    Meteor.users.update(
      { _id: user._id },
      {
        $push: {
          memberships: {
            host: 'circles.market',
            role: user.memberships[0].role,
            date: user.memberships[0].date,
          },
        },
      }
    );
  });
});
