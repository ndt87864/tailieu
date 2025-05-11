# Tailieuneu Clone

This project is a web application that replicates the layout, interface, and content of the specified pages from the website [tailieuneu.com](https://tailieuneu.com). It is built using React and styled with Tailwind CSS.

## Project Structure

```
tailieuneu-clone
├── public
│   └── index.html          # Main HTML entry point
├── src
│   ├── assets              # Static assets (images, fonts, etc.)
│   ├── components          # React components
│   │   ├── CategoryList.jsx # Component for displaying large categories
│   │   ├── CategoryItem.jsx # Component for individual category items
│   │   └── Navbar.jsx      # Navigation bar component
│   ├── pages               # Page components
│   │   ├── Home.jsx        # Landing page component
│   │   └── Category.jsx    # Page for displaying small categories
│   ├── styles              # CSS styles
│   │   └── main.css        # Main stylesheet
│   ├── App.jsx             # Main application component
│   └── index.js            # Entry point for the React application
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # npm configuration
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/tailieuneu-clone.git
   cd tailieuneu-clone
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- The application features a navigation bar that allows users to browse through different categories.
- Clicking on a large category will display its corresponding small categories.
- The layout is responsive and optimized for both desktop and mobile interfaces.

## Technologies Used

- React
- Tailwind CSS
- JavaScript
- HTML
- CSS

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.