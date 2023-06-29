<svelte:head>
  <title>Page 2</title>
</svelte:head>

<script>
	import { projectData } from '../../stores.js';

  export let form; 

  let testFile;

  function checkTF() {
    console.log(testFile.files)
  }
  
</script>

<div>
  <a class="button" style="margin-left: 2px;" href="/">Home</a>
</div>

<form method="POST">
  <label>
    Upload picture: 
    <input name="pic" bind:value={testFile} on:change={checkTF()} type="file" webkitdirectory directory>

    <!-- <input bind:this={testFile} name="pic" type="file"> -->
  </label>
  <div>
    <button type="submit">Send</button>
  </div>
</form>


<!-- select folder of imgs/upload folder or imgs -->
      <!-- extract file metadata for each image  -->
<!-- where should project save? -->
<!-- create structure for your annotation metadata -->
      <!-- offer (possibly modified) existing metadata structures? -->
