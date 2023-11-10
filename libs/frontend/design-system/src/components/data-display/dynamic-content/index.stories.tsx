import { Meta, Story } from '@storybook/react';

import { DynamicContent, Props } from '.';

export default {
  title: 'Components/Data Display/Dynamic Content',
  component: DynamicContent,
} as Meta;
const Template: Story<Props> = (args) => (
  <div style={{ width: 660 }}>
    <DynamicContent {...args} />
  </div>
);

export const Default: Story<Props> = Template.bind({});

Default.args = {
  dynamicContent: [
    { title: 'Please review the following:', content: [] },
    {
      title: 'Terms and Conditions',
      content: [
        {
          content: [
            'Lorem ipsum dolor sit amet consectetur. Ipsum adipiscing mi fringilla id nunc diam. Elementum feugiat diam sed iaculis dignissim mauris sed amet sapien.',
          ],
        },
      ],
      isTitleBold: true,
    },
    {
      isContentNumberingTitle: true,
      numberingTitleContent: [
        {
          title: 'Quis risus tortor sit vel eros posuere ornare in urna.',
          content: [
            {
              content: ['Adipiscing vitae at sed purus. Sit ut eget elementum id id impemattis.', 'Ipsum adipiscing mi fringilla id nunc'],
              contentType: 'ORDERED',
            },
          ],
        },
      ],
    },
    {
      content: [
        'Lorem ipsum dolor sit amet consectetur. Ipsum adipiscing mi fringilla id nunc diam. Elementum feugiat diam sed iaculis dignissim mauris sed amet sapien. Quis risus tortor sit vel eros posuere ornare in urna. Ipsum eget amet dictum aliquam. Adipiscing vitae at sed purus. Sit ut eget elementum id id impemattis. Lorem ipsum dolor sit amet consectetur. Ipsum adipiscing mi fringilla id nunc diam. Elementum feugiat diam sed.',
      ],
    },
    {
      content: [
        'Ipsum dolor sit amet consectetur. Ipsum adipiscing mi fringilla id nunc diaLorem ipsum dolor sit amet consectetur. Ipsum adipiscing mi fringilla id nunc diam.',
      ],
    },
  ],
} as Props;

export const ContentOnly: Story<Props> = Template.bind({});

ContentOnly.args = {
  dynamicContent: [
    { content: ['This is a content only input'] },
    { content: ['This example has no content type set.', 'But it can have multiple sections'] },
  ],
} as Props;

export const OrderedContentOnly: Story<Props> = Template.bind({});

OrderedContentOnly.args = {
  dynamicContent: [{ content: ['First item in ordered list', 'Second item in ordered list'], contentType: 'ORDERED' }],
} as Props;

export const UnorderedContentOnly: Story<Props> = Template.bind({});

UnorderedContentOnly.args = {
  dynamicContent: [{ content: ['First item in unordered list', 'Second item in unordered list'], contentType: 'UNORDERED' }],
} as Props;

export const TitleWithContent: Story<Props> = Template.bind({});

TitleWithContent.args = {
  dynamicContent: [
    {
      title: 'Title one with Content',
      content: [
        { content: ['Its content can contain any type of content'] },
        {
          title: 'Title two nested as content of "Title one with Content"',
          isTitleBold: true,
          content: [{ content: ['There will not be any section spacing if the content is nested in another content'] }],
        },
      ],
      isTitleBold: true,
    },
  ],
} as Props;

export const NumberedTitleWithContent: Story<Props> = Template.bind({});

NumberedTitleWithContent.args = {
  dynamicContent: [
    {
      isContentNumberingTitle: true,
      numberingTitleContent: [
        {
          title: 'Title one with ordered content type:',
          content: [
            {
              content: ['Adipiscing vitae at sed purus. Sit ut eget elementum id id impemattis.', 'Ipsum adipiscing mi fringilla id nunc'],
              contentType: 'ORDERED',
            },
          ],
        },
        {
          title: 'Title two with unordered content type:',
          content: [
            {
              content: ['Adipiscing vitae at sed purus. Sit ut eget elementum id id impemattis.', 'Ipsum adipiscing mi fringilla id nunc'],
              contentType: 'UNORDERED',
            },
          ],
        },
        {
          title: 'Title three with content without content type',
          content: [
            {
              content: ['Adipiscing vitae at sed purus. Sit ut eget elementum id id impemattis.', 'Ipsum adipiscing mi fringilla id nunc'],
            },
          ],
        },
      ],
    },
  ],
} as Props;

export const AgencyExample: Story<Props> = Template.bind({});

AgencyExample.args = {
  dynamicContent: [
    {
      title: 'Terms and Conditions',
      content: [
        {
          isContentNumberingTitle: true,
          numberingTitleContent: [
            {
              title: 'Testing sentence number one.',
              content: [],
            },
            {
              title: 'Testing sentence number two:',
              content: [
                {
                  content: [
                    'Information in the test can only be used for testing.',
                    'Information in the test cannot be used for testing.',
                    'Information in the test can only be disclosed to another person testing.',
                  ],
                  contentType: 'ORDERED',
                },
              ],
            },
            {
              title: 'Testing sentence number three.',
              content: [],
            },
            {
              title: 'Testing sentence number four.',
              content: [],
            },
            {
              title: 'Testing sentence number five.',
              content: [],
            },
          ],
        },
      ],
      isTitleBold: true,
    },
  ],
} as Props;
