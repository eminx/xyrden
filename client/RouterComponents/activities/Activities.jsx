import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../UIComponents/Loader';
import PublicActivityThumb from '../../UIComponents/PublicActivityThumb';
import { Box, Button } from 'grommet';

const yesterday = moment(new Date()).add(-1, 'days');

const getFirstFutureOccurence = (occurence) =>
  moment(occurence.endDate).isAfter(yesterday);

const compareForSort = (a, b) => {
  const firstOccurenceA = a.datesAndTimes.find(getFirstFutureOccurence);
  const firstOccurenceB = b.datesAndTimes.find(getFirstFutureOccurence);
  const dateA = new Date(
    firstOccurenceA.startDate + 'T' + firstOccurenceA.startTime + ':00Z'
  );
  const dateB = new Date(
    firstOccurenceB.startDate + 'T' + firstOccurenceB.startTime + ':00Z'
  );
  return dateA - dateB;
};

function Activities({ activitiesList, processesList, isLoading }) {
  const { currentUser, canCreateContent } = useContext(StateContext);

  const getPublicActivities = () => {
    if (!activitiesList) {
      return null;
    }

    const publicActivities = activitiesList.filter(
      (activity) => activity.isPublicActivity === true
    );

    const futurePublicActivities = publicActivities.filter((activity) =>
      activity.datesAndTimes.some((date) =>
        moment(date.endDate).isAfter(yesterday)
      )
    );

    return futurePublicActivities;
  };

  const getProcessMeetings = () => {
    if (!processesList) {
      return null;
    }

    const futureProcesses = processesList.filter((process) =>
      process.meetings.some((meeting) =>
        moment(meeting.startDate).isAfter(yesterday)
      )
    );

    const futureProcessesWithAccessFilter = parseOnlyAllowedProcesses(
      futureProcesses
    );

    return futureProcessesWithAccessFilter.map((process) => ({
      ...process,
      datesAndTimes: process.meetings,
      isProcess: true,
    }));
  };

  const parseOnlyAllowedProcesses = (futureProcesses) => {
    const futureProcessesAllowed = futureProcesses.filter((process) => {
      if (!process.isPrivate) {
        return true;
      } else {
        if (!currentUser) {
          return false;
        }
        const currentUserId = currentUser._id;
        return (
          process.adminId === currentUserId ||
          process.members.some((member) => member.memberId === currentUserId) ||
          process.peopleInvited.some(
            (person) => person.email === currentUser.emails[0].address
          )
        );
      }
    });

    return futureProcessesAllowed;
  };

  const getAllSorted = () => {
    const allActitivities = [...getPublicActivities(), ...getProcessMeetings()];
    return allActitivities.sort(compareForSort);
  };

  const allSortedActivities = getAllSorted();

  return (
    <Box width="100%" margin={{ bottom: '50px' }}>
      {isLoading ? (
        <Loader />
      ) : (
        <Box>
          {canCreateContent && (
            <Box
              direction="row"
              justify="center"
              width="100%"
              margin={{ bottom: 'medium' }}
            >
              <Link to="/new-activity">
                <Button size="small" label="New Activity" />
              </Link>
            </Box>
          )}
          <Box direction="row" wrap justify="center">
            {allSortedActivities.map((activity) => {
              return (
                <Link
                  key={activity.title}
                  to={
                    activity.isProcess
                      ? `/process/${activity._id}`
                      : `/activity/${activity._id}`
                  }
                >
                  <PublicActivityThumb item={activity} />
                </Link>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Activities;