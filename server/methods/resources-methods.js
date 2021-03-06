import { Meteor } from 'meteor/meteor';
import { getHost, isContributorOrAdmin } from './shared';

Meteor.methods({
  getResources() {
    const host = getHost(this);

    return Resources.find({ host }, { sort: { creationDate: 1 } }).fetch();
  },

  createResource(values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    const resources = Resources.find({ host }).fetch();
    if (resources.some((resource) => resource.label === values.label)) {
      throw new Meteor.Error('There already is a resource with this name');
    }
    if (values.label.length < 3) {
      throw new Meteor.Error(
        'Resource name is too short. Minimum 3 letters required'
      );
    }

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('You are not allowed');
    }

    try {
      const newResourceId = Resources.insert({
        ...values,
        resourceIndex: resources.length,
        host,
        authorId: user._id,
        authorAvatar: user.avatar || '',
        authorUsername: user.username,
        authorFirstName: user.firstName,
        authorLastName: user.lastName,
        creationDate: new Date(),
      });
      return newResourceId;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error);
    }
  },

  updateResource(resourceId, values) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });
    const resources = Resources.find({ host }).fetch();
    const otherResources = resources.filter((res) => res._id !== resourceId);
    if (otherResources.some((resource) => resource.label === values.label)) {
      throw new Meteor.Error('There already is a resource with this name');
    }
    if (values.label.length < 3) {
      throw new Meteor.Error(
        'Resource name is too short. Minimum 3 letters required'
      );
    }

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('You are not allowed');
    }
    try {
      Resources.update(resourceId, {
        $set: {
          ...values,
          updatedBy: user.username,
          latestUpdate: new Date(),
        },
      });
      return values.label;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't add to Collection");
    }
  },

  deleteResource(resourceId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('You are not allowed');
    }

    try {
      Resources.remove(resourceId);
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't remove from collection");
    }
  },
});
