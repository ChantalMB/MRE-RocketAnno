# RocketAnnotator 
- MRE Technical Component- App  

- Not only is the name of this app an hommage to the conception of it as a task specific annotator for the [International Space Station Archaeological Project](https://issarchaeology.org/), rockets in popular imagination also embody the concepts surrounding  image annotation that will be discussed in my MRE. While rockets possess immense power and can achieve incredible velocities, the journey to their destination is often marked by a deliberate and gradual progression. Following the lengthy actual construction of the rocket, the launch itself involves a series of carefully orchestrated stages, and once in space, rockets rely on the principles of orbital mechanics, where precise calculations and carefully planned trajectories are necessary to navigate through the vast expanses of the cosmos. These complex maneuvers can take months or even years, depending on the target, requiring patience, meticulous planning, and precise execution. Like rockets, the process of image annotation is often perceived to be a fast process, but to be done with care, requires multiple checks during the annotation process to ensure the resulting model does not cause harm.

## Usage Guide 

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
