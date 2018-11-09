Meteor.methods({
  createGroup(formValues, imageUrl, documentUrl, documentId) {
    const user = Meteor.user();
    if (!user || !user.isRegisteredMember) {
      throw new Meteor.Error('Not allowed!');
    }
    check(formValues.title, String);
    check(formValues.description, String);
    check(formValues.readingMaterial, String);
    check(formValues.capacity, Number);
    check(documentUrl, String);
    check(documentId, String);

    try {
      const add = Groups.insert(
        {
          adminId: user._id,
          adminUsername: user.username,
          members: [
            {
              memberId: user._id,
              username: user.username,
              profileImage: user.profileImage || null,
              joinDate: new Date()
            }
          ],
          title: formValues.title,
          description: formValues.description,
          readingMaterial: formValues.readingMaterial,
          capacity: formValues.capacity || 20,
          imageUrl,
          documentUrl,
          documentId,
          isPublished: true,
          creationDate: new Date()
        },
        () => {
          Meteor.call('createChat', formValues.title, add, (error, result) => {
            if (error) {
              console.log('Chat is not created due to error: ', error);
            }
          });
        }
      );

      try {
        Meteor.users.update(user._id, {
          $addToSet: {
            groups: {
              groupId: add,
              name: formValues.title,
              joinDate: new Date(),
              meAdmin: true
            }
          }
        });
      } catch (error) {
        throw new Meteor.Error(
          error,
          "Couldn't add the group info to user collection, but group is created"
        );
        console.log(error);
      }
      return add;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't add group to the collection");
      console.log(error);
    }
  },

  updateGroup(groupId, formValues, imageUrl, documentUrl, documentId) {
    const user = Meteor.user();
    if (!user || !user.isRegisteredMember) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (user._id !== theGroup.adminId) {
      throw new Meteor.Error('You are not allowed!');
      return false;
    }

    check(formValues.title, String);
    check(formValues.description, String);
    check(formValues.readingMaterial, String);
    check(formValues.capacity, Number);
    check(documentUrl, String);
    check(documentId, String);

    try {
      const add = Groups.update(groupId, {
        $set: {
          title: formValues.title,
          description: formValues.description,
          readingMaterial: formValues.readingMaterial,
          capacity: formValues.capacity,
          imageUrl,
          documentId,
          documentUrl
        }
      });
      return groupId;
    } catch (e) {
      throw new Meteor.Error(e, "Couldn't update the group");
    }
  },

  joinGroup(groupId) {
    const user = Meteor.user();
    if (!user || !user.isRegisteredMember) {
      throw new Meteor.Error('You are not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    try {
      Groups.update(theGroup._id, {
        $addToSet: {
          members: {
            memberId: user._id,
            username: user.username,
            profileImage: user.profileImage || null,
            joinDate: new Date()
          }
        }
      });
      Meteor.users.update(user._id, {
        $addToSet: {
          groups: {
            groupId: theGroup._id,
            name: theGroup.name,
            joinDate: new Date()
          }
        }
      });
    } catch (error) {
      throw new Meteor.Error('Could not join the circle');
    }
  },

  leaveGroup(groupId) {
    const user = Meteor.user();
    if (!user || !user.isRegisteredMember) {
      throw new Meteor.Error('You are not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    try {
      Groups.update(theGroup._id, {
        $pull: {
          members: {
            memberId: user._id
          }
        }
      });
      Meteor.users.update(user._id, {
        $pull: {
          groups: {
            groupId: groupId
          }
        }
      });
    } catch (error) {
      throw new Meteor.Error('Could not leave the circle');
    }
  }
});
