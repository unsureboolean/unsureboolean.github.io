# Jeff Tuel Personal Website

A professional personal website showcasing Jeff Tuel's experience, projects, and interests. The site includes interactive features like AI artwork and a PersonaZoo chat interface powered by OpenAI.

## Features

### Main Website
- Responsive design that works on desktop and mobile devices
- Professional layout with smooth animations and transitions
- Sections for About, Experience, Projects, Personal Life, and Beliefs
- Contact form powered by Formspree
- Resume download functionality

### AI Artwork Gallery
- Showcase of AI-generated artwork
- Modal image viewing for detailed inspection
- Responsive grid layout

### PersonaZoo Chat Interface
- Interactive chat with multiple AI personas
- Auto-unlocking functionality for seamless visitor experience
- Personas include: Helpful Assistant, Tobias Fünke, Butters Stotch, Sheldon Cooper, Socrates, Jack Sparrow, and Homer Simpson
- Powered by OpenAI's API with client-side encryption for API key security

## Technical Details

### Structure
- `index.html` - Main landing page
- `aiartwork.html` - AI artwork gallery
- `personazoo.html` - PersonaZoo chat interface
- `js/` - JavaScript files
  - `animations.js` - Animations and visual effects
  - `personas.js` - Persona definitions and system prompts
  - `openai-chat-auto-unlock.js` - OpenAI API integration with auto-unlock functionality
- `images/` - Website images and assets
- `backup/` - Backup of previous implementation files

### Technologies Used
- HTML5
- CSS3 with Tailwind CSS
- JavaScript (ES6+)
- Font Awesome for icons
- AOS (Animate On Scroll) library
- OpenAI API integration

## Setup and Maintenance

### OpenAI API Integration
The PersonaZoo chat feature requires an OpenAI API key to function. The key is stored in encrypted form in the JavaScript code.

To update the API key:
1. Open `js/openai-chat-auto-unlock.js`
2. Find the `ENCRYPTED_API_KEY` constant
3. Replace it with your newly encrypted key (see encryption instructions in the file comments)
4. Update the `AUTO_UNLOCK_PASSWORD` if needed

### Formspree Contact Form
The contact form uses Formspree for processing. To update or troubleshoot:
1. Log in to your Formspree account
2. Verify the form ID in your dashboard
3. Update the form action URL in `index.html` if needed:
   ```html
   <form action="https://formspree.io/f/your-form-id" method="POST">
   ```

### Adding New Content
- **New sections**: Add new sections following the existing HTML structure pattern
- **New projects**: Add to the grid in the Projects section
- **New AI artwork**: Add images to the gallery in `aiartwork.html`
- **New personas**: Add definitions to the `personas.js` file

## Deployment

This website is designed to be hosted on GitHub Pages or any static web hosting service.

To deploy updates:
1. Make your changes locally
2. Test thoroughly
3. Commit and push to your GitHub repository
4. GitHub Pages will automatically update your site

## Browser Compatibility

The website is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

All rights reserved. This code is not open-source.

## Contact

For questions or support, contact Jeff Tuel via the contact form on the website or at contact@jefftuel.com.
