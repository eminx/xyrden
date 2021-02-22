import { withTracker } from 'meteor/react-meteor-data';
import React, { useContext, useState } from 'react';
import { Anchor, Box, Heading, Image, Text } from 'grommet';
import {
  Avatar,
  Image as ChakraImage,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import renderHTML from 'react-render-html';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../UIComponents/Loader';
import Template from '../../UIComponents/Template';
import { message } from '../../UIComponents/message';
import { call } from '../../functions';
import WorkThumb from '../../UIComponents/WorkThumb';

const getFullName = (member) => {
  const { firstName, lastName } = member;
  if (firstName && lastName) {
    return firstName + ' ' + lastName;
  } else {
    return firstName || lastName || '';
  }
};

function MemberPublic({
  isLoading,
  member,
  memberWorks,
  currentUser,
  history,
}) {
  if (!member || isLoading) {
    return <Loader />;
  }
  const { currentHost } = useContext(StateContext);
  const [avatarModal, setAvatarModal] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const setAsParticipant = async (user) => {
    try {
      await call('setAsParticipant', user.id);
      message.success(`${user.username} is now set back as a participant`);
    } catch (error) {
      console.log(error);
      message.error(error.reason || error.error);
    }
  };

  const setAsContributor = async (user) => {
    try {
      await call('setAsContributor', user.id);
      message.success(`${user.username} is now set as a contributor`);
    } catch (error) {
      console.log(error);
      message.error(error.reason || error.error);
    }
  };

  const worksItem =
    currentHost &&
    currentHost.settings.menu &&
    currentHost.settings.menu.find((item) => item.name === 'works');

  const worksLabel =
    worksItem &&
    worksItem.label &&
    worksItem.label[0].toUpperCase() + worksItem.label.substr(1).toLowerCase();

  const avatarExists = member.avatar && member.avatar.src;

  return (
    <Template
      leftContent={
        member && (
          <Box align="center" margin="medium" className="text-content">
            <Avatar
              name={member.username}
              src={member.avatar && member.avatar.src}
              size="2xl"
              onClick={avatarExists ? () => setAvatarModal(true) : null}
              style={{ cursor: avatarExists ? 'pointer' : 'default' }}
            />
            <Text weight="bold" size="large" textAlign="center">
              {member.username}
            </Text>
            <Text textAlign="center">{getFullName(member)}</Text>

            {member.bio && (
              <Box margin={{ top: 'small' }}>{renderHTML(member.bio)}</Box>
            )}

            <Anchor onClick={onOpen} as="button" margin={{ top: 'medium' }}>
              Contact
            </Anchor>
          </Box>
        )
      }
    >
      {worksLabel && member && (
        <Heading level={3} margin="medium">
          {worksLabel} by {member.username}
        </Heading>
      )}
      {memberWorks && memberWorks.length > 0 ? (
        memberWorks.map((work, index) => (
          <WorkThumb key={work._id} work={work} history={history} />
        ))
      ) : (
        <Box width="100%" background="dark-1" pad="small" align="center">
          <Heading level={4} margin="small">
            Nothing published just yet
          </Heading>
          <Box direction="row" align="center">
            <Image
              fit="contain"
              src="https://media.giphy.com/media/a0dG9NJaR2tQQ/giphy.gif"
            />
          </Box>
          <Text margin="small">
            <b>{member.username}</b> have not been very active so far
          </Text>
        </Box>
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        size="sm"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{getFullName(member)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box className="text-content" margin={{ bottom: 'medium' }}>
              {member.contactInfo
                ? renderHTML(member.contactInfo)
                : 'No contact info registered for this user'}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {avatarExists && (
        <Modal
          isOpen={avatarModal}
          onClose={() => setAvatarModal(false)}
          onOpen={() => setAvatarModal(false)}
          size="xs"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ChakraImage
              src={member.avatar.src}
              alt={member.username}
              fit="contain"
            />
          </ModalContent>
        </Modal>
      )}
    </Template>
  );
}

export default Member = withTracker(({ match, history }) => {
  const { username } = match.params;
  const publicMemberSubscription = Meteor.subscribe('memberAtHost', username);
  const publicMemberWorksSubscription = Meteor.subscribe(
    'memberWorksAtHost',
    username
  );
  const isLoading =
    !publicMemberSubscription.ready() || !publicMemberWorksSubscription.ready();
  const currentUser = Meteor.user();
  const member = Meteor.users.findOne({ username });
  const memberWorks = Works.find({ authorUsername: username }).fetch();
  return {
    isLoading,
    currentUser,
    member,
    memberWorks,
    history,
  };
})(MemberPublic);
