import {defineType, defineField} from 'sanity'

export const shopMkProductType = defineType({
  name: 'shopMkProduct',
  title: 'Shop MK Product',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Home Decor',
          'Lifestyle',
          'Kitchen',
          'Bathroom',
          'Lighting',
          'Storage',
          'Accessories',
          'Bedroom',
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'White', value: 'White'},
          {title: 'Black', value: 'Black'},
          {title: 'Pink', value: 'Pink'},
          {title: 'Gold', value: 'Gold'},
          {title: 'Grey', value: 'Grey'},
          {title: 'Brown', value: 'Brown'},
          {title: 'Cream', value: 'Cream'},
          {title: 'Silver', value: 'Silver'},
          {title: 'Blue', value: 'Blue'},
          {title: 'Red', value: 'Red'},
          {title: 'Green', value: 'Green'},
          {title: 'Beige', value: 'Beige'},
          {title: 'Purple', value: 'Purple'},
        ],
        layout: 'grid', // shows as checkboxes in a grid — easy to tick
      },
      description: 'Select all available colors for this product.',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
    }),

    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'images.0',
      subtitle: 'category',
      price: 'price',
    },

    prepare(selection) {
      const {title, media, subtitle, price} = selection

      return {
        title,
        subtitle: `${subtitle || 'No Category'} • ₦${price || 0}`,
        media,
      }
    },
  },
})
