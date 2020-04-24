import React from 'react';
import ReactQuill from 'react-quill';
import { editorFormats, editorModules } from '../themes/skogen';
import {
  // Form,
  Input,
  // Button,
  InputNumber,
  Upload,
  Icon,
  Divider,
  Modal,
  message
} from 'antd/lib';
const FormItem = Form.Item;

import { Form, FormField, Box, TextInput, Button } from 'grommet';

class CreateGroupForm extends React.Component {
  handleSubmit = ({ value }) => {
    console.log(value);
    return;

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!this.props.uploadableImage) {
        Modal.error({
          title: 'Image is required',
          content: 'Please upload an image'
        });
        return;
      }

      const values = {
        title: fieldsValue['title'],
        description: fieldsValue['description'],
        readingMaterial: fieldsValue['readingMaterial'],
        capacity: fieldsValue['capacity']
      };

      if (!err) {
        this.props.registerGroupLocally(values);
      }
    });
  };

  render() {
    // const { getFieldDecorator } = this.props.form;
    const {
      uploadableImage,
      setUploadableImage,
      uploadableDocument,
      setUploadableDocument,
      groupData
    } = this.props;

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Box pad="small">
            <FormField label="Title">
              <TextInput name="title" placeholder="Understanding Benjamin" />
            </FormField>
          </Box>

          <Box pad="small">
            <FormField label="Subtitle">
              <TextInput
                name="readingMaterial"
                placeholder="through his book Illuminations"
              />
            </FormField>
          </Box>

          <Box pad="small">
            <FormField label="Description">
              <ReactQuill
                name="description"
                modules={editorModules}
                formats={editorFormats}
              />
            </FormField>
          </Box>

          <Box direction="row" justify="end" pad="small">
            <Button type="submit" primary label="Continue" />
          </Box>
        </Form>

        {/*<Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('title', {
              rules: [
                {
                  required: true,
                  message: 'Please enter the Title'
                }
              ],
              initialValue: groupData ? groupData.title : null
            })(<Input placeholder="Group title" />)}
          </FormItem>

          <FormItem>
            {getFieldDecorator('readingMaterial', {
              rules: [
                {
                  required: true,
                  message: 'Please enter a subtitle'
                }
              ],
              initialValue: groupData ? groupData.readingMaterial : null
            })(<Input placeholder="Subtitle" />)}
          </FormItem>

          <FormItem>
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: 'Please enter a detailed description'
                }
              ],
              initialValue: groupData ? groupData.description : null
            })(<ReactQuill modules={editorModules} formats={editorFormats} />)}
          </FormItem>

          <FormItem>
            {getFieldDecorator('capacity', {
              rules: [
                {
                  required: true,
                  message: 'Please enter capacity for the group'
                }
              ],
              min: 2,
              max: 50,
              initialValue: groupData ? groupData.capacity : null
            })(
              <InputNumber min={2} max={50} placeholder="Capacity" autosize />
            )}
          </FormItem>

          <FormItem
            className="upload-image-col"
            extra={uploadableImage ? null : 'Pick an image from your device'}
          >
            <Upload
              name="gathering"
              action="/upload.do"
              onChange={setUploadableImage}
              required
            >
              {uploadableImage ? (
                <Button>
                  <Icon type="check-circle" />
                  Image selected
                </Button>
              ) : (
                <Button>
                  Choose an image
                </Button>
              )}
            </Upload>
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
      </div>
    );
  }
}

export default CreateGroupForm;
