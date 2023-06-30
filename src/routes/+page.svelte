<script>
  import LoadModal from '$lib/LoadModal.svelte';
  import NewModal from '$lib/NewModal.svelte';

  import { projectData, projectSavePath, dataAdded, projectDataLoaded, imgPath } from '../stores.js';
  import { goto } from '$app/navigation';
  
  let showLoadModal = false;
  let showNewModal = false;

  const replacer = (key, value) => {
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch (error) {
        return value;
      }
    }
    return value;
  };

  function getFilePath(fp) {
    // TO DO: better way to split file paths? in case user puts slash in file name...
    let sep;
    if (window.navigator.userAgent.indexOf("Windows") != -1) {
      sep = "\\";
    } else {
      sep = "/";
    }

    fp = fp.split(sep);
    fp.pop();

    let final_fp = "file://" + fp.join(sep) + sep;
    return(final_fp)
  }

  const onDirSelected=(e)=> {
    $imgPath = getFilePath(e.target.files[0]['path']);
    console.log($imgPath)
  }

  const onLoadProject=(e)=> {
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);

    reader.onload = e => {
      let json = e.target.result;
      const obj = JSON.parse(json, replacer);
      setProject(Object.keys(obj)[0], Object.values(obj)[0])
    }

  }

  function setProject(folderpath, project) {
    $projectSavePath = folderpath;
    $projectData = project;
    $dataAdded = true;
    $projectDataLoaded = true;
  }

</script>

<svelte:head>
  <title>RocketAnnotator</title>
</svelte:head>

<main>
  <h1 class="text-primary">RocketAnnotator</h1>
  <button on:click={() => (showNewModal = true)}>
    New Project
  </button>
  <button on:click={() => (showLoadModal = true)}>
    Load Project
  </button>
</main>

<LoadModal bind:showLoadModal>
	<h2 slot="header">
		Select Image folder and Project File
	</h2>

  <input type="file" webkitdirectory on:change={(e)=>onDirSelected(e)}>
  
  <hr/>

  <input type="file" accept=".json" on:change={(e)=>onLoadProject(e)} />
  
  <hr/>
  
  <button on:click={()=> (goto('/workspace'))}>
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>

</LoadModal>

<NewModal bind:showNewModal>
	<h2 slot="header">
		Select Image Folder
	</h2>

  <input type="file" webkitdirectory on:change={(e)=>onDirSelected(e)}>
  
  <hr/>
  
  <button on:click={()=> (goto('/workspace'))}>
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>

</NewModal>

<style lang="scss">
  
  main {
    text-align: center;
  }

  h1 {
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 4rem auto;
    max-width: 14rem;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }
  }

  a {
      text-decoration: none;
      color: #FFFFFF;
    }

  button:hover a {
    text-decoration: none;
    color: #FF4742;
  }

  button {
    background: #FF4742;
    border: 1px solid #FF4742;
    border-radius: 6px;
    box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 4px;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-block;
    font-size: 16px;
    font-weight: 800;
    line-height: 16px;
    min-height: 40px;
    outline: 0;
    padding: 12px 14px;
    text-align: center;
    text-rendering: geometricprecision;
    text-transform: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
  }

  button:hover,
  button:active {
    background-color: initial;
    background-position: 0 0;
    color: #FF4742;
  }

  button:active {
    opacity: .5;
  }
</style>
