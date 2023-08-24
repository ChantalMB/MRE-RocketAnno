# RocketAnnotator 
- MRE Technical Component- App  

- Not only is the name of this app an hommage to the conception of it as a task specific annotator for the [International Space Station Archaeological Project](https://issarchaeology.org/), rockets in popular imagination also embody the concepts surrounding  image annotation that will be discussed in my MRE. While rockets possess immense power and can achieve incredible velocities, the journey to their destination is often marked by a deliberate and gradual progression. Following the lengthy actual construction of the rocket, the launch itself involves a series of carefully orchestrated stages, and once in space, rockets rely on the principles of orbital mechanics, where precise calculations and carefully planned trajectories are necessary to navigate through the vast expanses of the cosmos. These complex maneuvers can take months or even years, depending on the target, requiring patience, meticulous planning, and precise execution. Like rockets, the process of image annotation is often perceived to be a fast process, but to be done with care, requires multiple checks during the annotation process to ensure the resulting model does not cause harm.

## New Project Guide 
- **To download:** Click the link under "Releases" to the right of this page.

- **Setup**: 
  - If you haven't already, move all images you would potentially like to annotate into one folder.
- Upon opening the application, when you select "New Project" you will be prompted to select the folder your images are in. After this is done, you will be allowed to enter the workspace.
- Once in the workspace, you will first want to upload some images to annotate! Locate the image icon with a plus button beside the word "Images" to the right of the screen, and when you click that, you will be prompted to select the images you would like to start annotating. You can begin with only a few and then add more later, or you can upload all the images in your image folder however if this is a significant number of images it may take some time to load all of the images in (ex. 15000 images takes around 5min to fully upload).
- Once your images are uploaded, you may start annotating! Some discussion of the tools available:
  - **Upper left toolbar** (from top to bottom):
    - Rectangle annotation tool is the default annotation tool-- it allows you to draw rectangles around objects
    - Polygon annotation tool allows you to draw polygons around objects
    - Zoom-in can be done with this button, or with trackpad/mouse gestures
    - Zoom-out, same as zoom-in!
    - Reset button recentres the image in the image viewer
  - **Bottom of screen**:
    - To the right there is arrows which allow you to scroll through your images-- this can also be done with the arrow keys
    - When you draw an annotation on the image displayed, a corresponding line will be added to the "Annotations" table. In this line you will be prompted to fill out basic information about the annotated object. 
      - You can add new columns to this table using the "+" that is below the arrows.
    - The "Metadata" tab allows you to view the image metadata associated with the displayed image.
  - **Upper right of screen** (from left to right):
    - Return to home page
    - Save project (although it will save automatically every 7min)
    - Select the folder where you would like your project file to save

## Notes
- This application has been most heavily tested on a 2022 M2 MacBook Air 
- If you do not specify where to save the project save file, it will save in the same folder at your images
- When exporting YOLO annotations, after splitting you must update the `data.yaml` with correct paths to training/validation/test folders 
- They most likely error you may encounter with this app is an "Unable to open [object Object]: Error loading image…"— this means that you tried to use an image that is not present in the image folder you selected when starting the project. Simply move the image to this folder and the error should resolve!
- If your image folder has a lot of images (~50000), it will take a couple of seconds to upload

## To-do (aka Known issues)
- Aesthetics
  - Autofill turns background of input blue (chrome security measure that is not necessary here)
  - Metadata viewer also autoscrolls to bottom which can be annoying
  - Resize annotation does not actually resize --> no way to disable the resizing handles
- Refactor code for readability

Find something else I should address? Submit an issue and I'll see what I can do!
  
## Commands
**Uses SvelteKit + Electron**
- `npm run dev`: Runs SvelteKit in dev mode
- `npm run preview`: Runs SvelteKit in production mode
- `npm run electron`: Runs SvelteKit with electron in dev mode
- `npm run build`: Runs SvelteKit compiler
- `npm run dev:package`: Creates an Electron package (you can inspect the contents)
- `npm run package`: Creates a distributable Electron package
