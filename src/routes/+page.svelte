<script>
  import LoadModal from '$lib/LoadModal.svelte';
  import NewModal from '$lib/NewModal.svelte';
  import icon from '$lib/assets/RA-icon-no-circle.svg';

  import { disableWorkspace, projectData, projectSavePath, dataAdded, projectDataLoaded, imgPath } from '../stores.js';
  import { goto } from '$app/navigation';
  
  let showLoadModal = false;
  let showNewModal = false;

  let dirSelected = false;
  let projSelected = false;

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
    dirSelected = true;
  }

  const onLoadProject=(e)=> {
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);

    reader.onload = e => {
      let json = e.target.result;
      const obj = JSON.parse(json, replacer);
      setProject(Object.keys(obj)[0], Object.values(obj)[0])
    }
    projSelected = true;
  }

  function setProject(folderpath, project) {
    $projectSavePath = folderpath;
    $projectData = project;
    $dataAdded = true;
    $projectDataLoaded = true;
  }

  $: if (showLoadModal) {
    if (dirSelected && projSelected) {
      $disableWorkspace = false;
      dirSelected = false;
      projSelected = false;
    }
  }

  $: if (showNewModal) {
    if (dirSelected) {
      $disableWorkspace = false;
      dirSelected = false;
    }
  }

</script>

<svelte:head>
  <title>RocketAnnotator</title>
</svelte:head>

<main>
  <img src={icon} alt="Rocket"/>

  <div class="home-content">
    <div class="interactive">
      <h1 class="text-primary">RocketAnnotator</h1>
      <button on:click={() => (showNewModal = true)}>
        New Project
      </button>
      <button on:click={() => (showLoadModal = true)}>
        Load Project
      </button>
    </div>
  </div>
</main>

<LoadModal bind:showLoadModal>
	<h2 slot="header">
		Select Image folder and Project
	</h2>

  <label> Folder:
  <input type="file" webkitdirectory on:change={(e)=>onDirSelected(e)}>
  </label>
  
  <hr/>

  <label> Project file:
  <input type="file" accept=".json" on:change={(e)=>onLoadProject(e)} />
  </label>

  <hr/>

  {#if $disableWorkspace}
  <button class="disabled">
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>
  {:else}
  <button on:click={()=> (goto('/workspace'))}>
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>
  {/if}

</LoadModal>

<NewModal bind:showNewModal>
	<h2 slot="header">
		Select Image Folder
	</h2>

  <label> Folder:
  <input type="file" class="loading" webkitdirectory on:change={(e)=>onDirSelected(e)}>
  </label>
  <hr/>

  {#if $disableWorkspace}
  <button class="disabled">
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>
  {:else}
  <button on:click={()=> (goto('/workspace'))}>
    Enter Workspace
    <!-- <a href="/workspace">Enter Workspace</a> -->
  </button>
  {/if}

</NewModal>

<style lang="scss">
  main {
    height: 100vh;
    text-align: center;
    position: relative; 
  }

  .home-content{
    display: flex;
    justify-content: center;
    align-items: center;
  }

  main img {
    width: 59vmin;
    height: 59vmin;  
  }

  .home-content .interactive {
    position: absolute; 
    left: 50%;                        /* horizontal alignment */
    top: 55%;                         /* vertical alignment */
    transform: translate(-50%, -50%);
    
  }

  h1 {
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 150;
    line-height: 1.1;
    max-width: 14rem;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }
  }

  button.disabled,
  button.disabled:hover,
  button.disabled:active {
    border: 1px solid #999999;
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
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
