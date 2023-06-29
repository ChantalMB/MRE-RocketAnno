# RocketAnnotator 
- MRE Technical Component- App  

- Not only is the name of this app an hommage to the conception of it as a task specific annotator for the [International Space Station Archaeological Project](https://issarchaeology.org/), rockets in popular imagination also embody the concepts surrounding  image annotation that will be discussed in my MRE. While rockets possess immense power and can achieve incredible velocities, the journey to their destination is often marked by a deliberate and gradual progression. Following the lengthy actual construction of the rocket, the launch itself involves a series of carefully orchestrated stages, and once in space, rockets rely on the principles of orbital mechanics, where precise calculations and carefully planned trajectories are necessary to navigate through the vast expanses of the cosmos. These complex maneuvers can take months or even years, depending on the target, requiring patience, meticulous planning, and precise execution. Like rockets, the process of image annotation is often perceived to be a fast process, but to be done with care, requires multiple checks during the annotation process to ensure the resulting model does not cause harm.

## Usage Notes
- When exporting YOLO annotations, after splitting you must update the `data.yaml` with correct paths to training/validation/test folders 

## To-do (aka Known issues)
- Aesthetics
  - Autofill turns background of input blue (chrome security measure that is not necessary here)
  - Icons not centered in button
  - Metadata viewer also autoscrolls to bottom which is annoying
  - Resize annotation does not resize --> no way to disable the resizing handles
- Refactor code for readability
- Search functionality not implemented
- Package for distribution
  
## Commands
**Uses SvelteKit + Electron**
- `npm run dev`: Runs SvelteKit in dev mode
- `npm run preview`: Runs SvelteKit in production mode
- `npm run electron`: Runs SvelteKit with electron in dev mode
- `npm run build`: Runs SvelteKit compiler
- `npm run dev:package`: Creates an Electron package (you can inspect the contents)
- `npm run package`: Creates a distributable Electron package
