// module.exports = {
//   plugins: [
//     require('@fullhuman/postcss-purgecss')({
//       content: [
//         './src/**/*.html',  // Scan HTML files
//         './src/**/*.ts',    // Scan TypeScript files
//       ],
//       safelist: ['*'], // Optional: Safelist some selectors if needed (you can exclude classes from being purged)
//     }),
//   ],
// };


module.exports = {
  plugins: [
    require('autoprefixer'), // Ensure autoprefixer is included
    require('postcss-preset-env')({ stage: 3 }), // Enable latest CSS features
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.html',  // Scan HTML files
        './src/**/*.ts',    // Scan TypeScript files
      ],
      safelist: ['*'], // Optional: Safelist some selectors if needed
    }),
  ],
};