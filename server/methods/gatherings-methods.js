Meteor.methods({
	createGathering(userId, formValues) {
		check(formValues.title, String);
		check(formValues.shortDescription, String);
		check(formValues.longDescription, String);
		check(formValues.room, String);
		check(formValues.capacity, Number);
		check(formValues.phoneNumber, String);
		check(formValues.isRSVPrequired, Boolean);
		
		const currentUserId = Meteor.userId();
		if (currentUserId === userId) {
			try {
				Gatherings.insert({
					createdBy: userId,
					title: formValues.title,
					shortDescription: formValues.shortDescription,
					longDescription: formValues.longDescription,
					room: formValues.room,
					capacity: formValues.capacity,
					phoneNumber: formValues.phoneNumber,
					isRSVPrequired: formValues.isRSVPrequired
				})
			} catch(e) {
				throw new Meteor.Error('phishy-spam', "Couldn't add to Collection");
			}
		}
	}
});