import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import { editorFormats, editorModules } from '../themes/skogen';

import {
  Row,
  Col,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Upload,
  Icon,
  Divider,
  Modal,
  message
} from 'antd/lib';
import {
  Box,
  Form,
  FormField,
  TextInput,
  TextArea,
  Text,
  Select,
  Button
} from 'grommet';
import moment from 'moment';

const compareForSort = (a, b) => {
  const dateA = moment(a.startDate, 'YYYY-MM-DD');
  const dateB = moment(b.startDate, 'YYYY-MM-DD');
  return dateA.diff(dateB);
};

const defaultCapacity = 40;

let emptyDateAndTime = {
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  attendees: [],
  capacity: defaultCapacity
};

const iconStyle = {
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 24,
  backgroundColor: '#f8f8f8'
};

function Field({ label, children, ...otherProps }) {
  return (
    <FormField label={label} {...otherProps} margin={{ bottom: 'medium' }}>
      {children}
    </FormField>
  );
}

class CreateBookingForm extends Component {
  state = {
    addSpaceModal: false,
    datesAndTimes: [emptyDateAndTime],
    formValues: {}
  };

  componentDidMount() {
    this.setDatesAndTimes();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.bookingData && this.props.bookingData) {
      this.setDatesAndTimes();
    }
  }

  setDatesAndTimes = () => {
    const { bookingData } = this.props;
    if (!bookingData) {
      return;
    }

    const datesAndTimesSorted = bookingData.datesAndTimes.sort(compareForSort);

    const datesAndTimesWithMoment = datesAndTimesSorted.map(recurrence => ({
      ...recurrence,
      startDateMoment: moment(recurrence.startDate, 'YYYY-MM-DD'),
      startTimeMoment: moment(recurrence.startTime, 'HH:mm'),
      endDateMoment: moment(recurrence.endDate, 'YYYY-MM-DD'),
      endTimeMoment: moment(recurrence.endTime, 'HH:mm'),
      capacity: recurrence.capacity,
      attendees: recurrence.attendees || []
    }));

    this.setState({
      datesAndTimes: datesAndTimesWithMoment
    });
  };

  addRecurrence = () => {
    this.setState({
      datesAndTimes: [...this.state.datesAndTimes, { ...emptyDateAndTime }]
    });
  };

  removeRecurrence = index => {
    const allOccurences = [...this.state.datesAndTimes];
    allOccurences.splice(index, 1);

    this.setState({
      datesAndTimes: allOccurences
    });
  };

  addSpace = name => {
    Meteor.call('addSpace', name, (err, res) => {
      if (err) {
        message.error(err.reason);
        console.log(err);
      } else {
        message.success('Your place succesfully added to the list :)');
        this.setState({ addSpaceModal: false });
      }
    });
  };

  handleFormValueChange = formValues => {
    this.setState({
      formValues
    });
  };

  handleQuillChange = longDescription => {
    const { formValues } = this.state;
    const newFormValues = {
      ...formValues,
      longDescription
    };
    this.setState({
      formValues: newFormValues
    });
  };

  handleSubmit = ({ value }) => {
    const { datesAndTimes } = this.state;
    const {
      isPublicActivity,
      uploadableImage,
      registerBookingLocally
    } = this.props;

    if (isPublicActivity && !uploadableImage) {
      Modal.error({
        title: 'Image is required',
        content: 'Please upload an image'
      });
      return;
    }

    const datesAndTimesWithoutMoment = datesAndTimes.map(recurrence => ({
      startDate: recurrence.startDate,
      startTime: recurrence.startTime,
      endDate: recurrence.endDate,
      endTime: recurrence.endTime,
      capacity: recurrence.capacity || defaultCapacity,
      attendees: recurrence.attendees || []
    }));

    const values = {
      ...value,
      datesAndTimes: datesAndTimesWithoutMoment
    };

    registerBookingLocally(values);
  };

  renderDateTime = () => {
    const { datesAndTimes } = this.state;

    return (
      <div style={{ marginBottom: 12 }}>
        {datesAndTimes.map((recurrence, index) => (
          <DatesAndTimes
            key={index}
            recurrence={recurrence}
            removeRecurrence={() => this.removeRecurrence(index)}
            isNotDeletable={index === 0}
            handleStartDateChange={(date, dateString) =>
              this.handleDateAndTimeChange(date, dateString, index, 'startDate')
            }
            handleStartTimeChange={(time, timeString) =>
              this.handleDateAndTimeChange(time, timeString, index, 'startTime')
            }
            handleFinishDateChange={(date, dateString) =>
              this.handleDateAndTimeChange(date, dateString, index, 'endDate')
            }
            handleFinishTimeChange={(time, timeString) =>
              this.handleDateAndTimeChange(time, timeString, index, 'endTime')
            }
            handleCapacityChange={value =>
              this.handleCapacityChange(value, index)
            }
          />
        ))}
        <div style={{ ...iconStyle, padding: 24 }}>
          <Icon
            style={{ fontSize: 48, cursor: 'pointer' }}
            type="plus-circle"
            onClick={this.addRecurrence}
          />
        </div>
      </div>
    );
  };

  handleDateAndTimeChange = (date, dateString, index, entity) => {
    const { datesAndTimes } = this.state;
    const newDatesAndTimes = datesAndTimes.map((item, i) => {
      if (index === i) {
        item[entity + 'Moment'] = date;
        item[entity] = dateString;
      }
      return item;
    });
    this.setState({
      datesAndTimes: newDatesAndTimes
    });
  };

  handleCapacityChange = (value, index) => {
    const { datesAndTimes } = this.state;
    const newDatesAndTimes = datesAndTimes.map((item, i) => {
      if (index === i) {
        item.capacity = value;
      }
      return item;
    });
    this.setState({
      datesAndTimes: newDatesAndTimes
    });
  };

  render() {
    const {
      uploadableImage,
      setUploadableImage,
      places,
      isPublicActivity
    } = this.props;

    const { addSpaceModal, formValues } = this.state;

    const placeOptions =
      places && places.map(part => ({ label: part.name, value: part.name }));

    return (
      <div>
        <Box direction="row" width="100%">
          <Box pad="medium" flex={{ grow: 2 }}>
            <Form
              onSubmit={this.handleSubmit}
              value={formValues}
              onChange={this.handleFormValueChange}
              errors={{ name: ['message', '<Box>...</Box>'] }}
              validate="blur"
            >
              <Field
                label="Title"
                required
                // help="This is typicaly title of your event"
                validate={(fieldValue, formValue) => console.log(fieldValue)}
              >
                <TextInput
                  plain={false}
                  name="title"
                  placeholder="give it a title"
                />
              </Field>

              {isPublicActivity && (
                <Field label="Subtitle">
                  <TextInput
                    plain={false}
                    name="subtitle"
                    placeholder="give it a subtitle (artist name etc.)"
                  />
                </Field>
              )}

              <Field label="Description">
                <ReactQuill
                  modules={editorModules}
                  formats={editorFormats}
                  onChange={this.handleQuillChange}
                />
              </Field>

              {isPublicActivity && (
                <Field label="Place">
                  <TextInput
                    plain={false}
                    name="place"
                    placeholder="Artistosphere"
                  />
                </Field>
              )}

              {isPublicActivity && (
                <Field label="Address">
                  <TextArea
                    plain={false}
                    name="address"
                    placeholder="17th Street, Berlin..."
                  />
                </Field>
              )}

              {isPublicActivity && (
                <Field label="Practical Info">
                  <TextArea
                    plain={false}
                    name="practicalInfo"
                    placeholder="17th Street, Berlin..."
                  />
                </Field>
              )}

              {isPublicActivity && (
                <Field label="Internal Info">
                  <TextArea
                    plain={false}
                    name="internalInfo"
                    placeholder="17th Street, Berlin..."
                  />
                </Field>
              )}

              <Field label="Place">
                <Select
                  plain={false}
                  placeholder="Select space/equipment"
                  options={placeOptions}
                />
              </Field>

              {isPublicActivity && (
                <Box>
                  <Upload
                    name="gathering"
                    action="/upload.do"
                    onChange={setUploadableImage}
                  >
                    {uploadableImage ? (
                      <Button>
                        <Icon type="check-circle" />
                        Image selected
                      </Button>
                    ) : (
                      <Button>
                        <Icon type="upload" />
                        Pick an image
                      </Button>
                    )}
                  </Upload>
                </Box>
              )}

              <Box direction="row" justify="end" pad="small">
                <Button type="submit" primary label="Create" />
              </Box>
            </Form>
            {/* 
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: 'Enter the Title'
                    }
                  ],
                  initialValue: bookingData ? bookingData.title : null
                })(<Input placeholder="Title" />)}
              </FormItem>

              {isPublicActivity && (
                <FormItem>
                  {getFieldDecorator('subTitle', {
                    rules: [
                      {
                        required: true,
                        message:
                          'Please enter a subtitle (typically artists name)'
                      }
                    ],
                    initialValue:
                      bookingData && bookingData.subTitle
                        ? bookingData.subTitle
                        : ''
                  })(<Input placeholder="Subtitle (i.e. the artist)" />)}
                </FormItem>
              )}

              <FormItem>
                {getFieldDecorator('longDescription', {
                  rules: [
                    {
                      message: 'Please enter a detailed description (optional)'
                    }
                  ],
                  initialValue: bookingData ? bookingData.longDescription : null
                })(
                  // <TextArea
                  //   placeholder="Description"
                  //   autosize={{ minRows: 3, maxRows: 6 }}
                  // />

                  <ReactQuill modules={editorModules} formats={editorFormats} />
                )}
              </FormItem>

              {isPublicActivity && (
                <FormItem
                  className="upload-image-col"
                  extra={
                    uploadableImage ? null : 'Pick an image from your device'
                  }
                >
                  <Upload
                    name="gathering"
                    action="/upload.do"
                    onChange={setUploadableImage}
                  >
                    {uploadableImage ? (
                      <Button>
                        <Icon type="check-circle" />
                        Image selected
                      </Button>
                    ) : (
                      <Button>
                        <Icon type="upload" />
                        Pick an image
                      </Button>
                    )}
                  </Upload>
                </FormItem>
              )}

              {isPublicActivity && (
                <FormItem>
                  {getFieldDecorator('place', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter the address'
                      }
                    ],
                    initialValue:
                      bookingData && bookingData.place
                        ? bookingData.place
                        : publicSettings.contextName
                  })(
                    <Input placeholder="Please enter the name of the place" />
                  )}
                </FormItem>
              )}

              {isPublicActivity && (
                <FormItem>
                  {getFieldDecorator('address', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter the address'
                      }
                    ],
                    initialValue:
                      bookingData && bookingData.address
                        ? bookingData.address
                        : publicSettings.contextAddress
                  })(<Input placeholder="Please enter the address" />)}
                </FormItem>
              )}

              {isPublicActivity && (
                <FormItem>
                  {getFieldDecorator('practicalInfo', {
                    rules: [
                      {
                        message: 'Please enter practical info (if any)'
                      }
                    ],
                    initialValue:
                      bookingData && bookingData.practicalInfo
                        ? bookingData.practicalInfo
                        : ''
                  })(
                    <TextArea
                      placeholder="Practical info"
                      autosize={{ minRows: 3, maxRows: 6 }}
                    />
                  )}
                </FormItem>
              )}

              {isPublicActivity && (
                <FormItem>
                  {getFieldDecorator('internalInfo', {
                    rules: [
                      {
                        message:
                          'Please enter internal info - shown only to members (if any)'
                      }
                    ],
                    initialValue:
                      bookingData && bookingData.internalInfo
                        ? bookingData.internalInfo
                        : ''
                  })(
                    <TextArea
                      placeholder="Internal info"
                      autosize={{ minRows: 3, maxRows: 6 }}
                    />
                  )}
                </FormItem>
              )}

              {currentUser && currentUser.isSuperAdmin && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: 10 }}>
                    Wanna add space/equipment to the list?
                  </span>
                  <Button
                    onClick={() => this.setState({ addSpaceModal: true })}
                  >
                    Add
                  </Button>
                </div>
              )}

              <FormItem>
                {getFieldDecorator('room', {
                  rules: [
                    {
                      required: true,
                      message: 'Please enter which part you want to book'
                    }
                  ],
                  initialValue: bookingData ? bookingData.room : 'Studio'
                })(
                  <Select placeholder="Select space/equipment">
                    {places
                      ? places.map((part, i) => (
                          <Option key={part.name + i} value={part.name}>
                            {part.name}
                          </Option>
                        ))
                      : null}
                  </Select>
                )}
              </FormItem>

              <FormItem
                wrapperCol={{
                  xs: { span: 24, offset: 0 },
                  sm: { span: 16, offset: 8 }
                }}
              >
                <Button type="primary" htmlType="submit">
                  Continue
                </Button>
              </FormItem>
            </Form> */}
          </Box>
          <Box pad="medium" flex={{ grow: 1 }}>
            {this.renderDateTime()}
          </Box>
        </Box>

        <Modal
          className="addSpace-modal"
          title="Add a space/equipment for booking"
          visible={addSpaceModal}
          onOk={() => this.setState({ addSpaceModal: false })}
          onCancel={() => this.setState({ addSpaceModal: false })}
        >
          <h3>
            Please enter the name of the space or equipment to be added to the
            list
          </h3>
          <Input.Search
            placeholder="type and press enter"
            enterButton="Add"
            size="large"
            onSearch={value => this.addSpace(value)}
          />
        </Modal>
      </div>
    );
  }
}

const segmentPad = {
  top: 'xxsmall',
  left: 'xxsmall',
  right: 'xxsmall',
  bottom: 'small'
};

class DatesAndTimes extends Component {
  render() {
    const {
      recurrence,
      handleStartDateChange,
      handleStartTimeChange,
      handleFinishDateChange,
      handleFinishTimeChange,
      handleCapacityChange,
      removeRecurrence,
      isNotDeletable
    } = this.props;

    return (
      <div
        style={{
          padding: 12,
          backgroundColor: '#f8f8f8',
          marginBottom: 12
        }}
      >
        {!isNotDeletable && (
          <div style={iconStyle}>
            <Icon
              style={{ fontSize: 18, cursor: 'pointer' }}
              type="delete"
              onClick={removeRecurrence}
            />
          </div>
        )}

        <Box pad="xxsmall">
          <DatePicker
            onChange={handleStartDateChange}
            value={recurrence.startDateMoment}
            placeholder="Start date"
          />
        </Box>
        <Box pad={segmentPad}>
          <TimePicker
            onChange={handleStartTimeChange}
            value={recurrence.startTimeMoment}
            format="HH:mm"
            minuteStep={5}
            placeholder="Start time"
          />
        </Box>
        <Box pad="xxsmall">
          <DatePicker
            placeholder="Finish date"
            onChange={handleFinishDateChange}
            value={recurrence.endDateMoment}
          />
        </Box>
        <Box pad={segmentPad}>
          <TimePicker
            onChange={handleFinishTimeChange}
            value={recurrence.endTimeMoment}
            format="HH:mm"
            minuteStep={5}
            placeholder="Finish time"
          />
        </Box>
        <Box pad="xxsmall">
          <InputNumber
            min={1}
            max={90}
            placeholder={'Capacity'}
            value={recurrence.capacity}
            onChange={handleCapacityChange}
          />
        </Box>
      </div>
    );
  }
}

export default CreateBookingForm;
