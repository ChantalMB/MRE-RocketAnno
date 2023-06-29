<svelte:head>
  <title>Workspace</title>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  import { projectData, projectSavePath, dataAdded, projectDataLoaded } from '../../stores.js';

  import JSZip from 'jszip';
  import ExifReader from 'exifreader';
  import area from 'area-polygon'
  import { saveAs } from 'file-saver';

  import { ZoomIn, 
          ZoomOut, 
          RefreshCcw, 
          ChevronLeft, 
          ChevronRight, 
          Home, 
          Save, 
          ImagePlus, 
          ImageMinus,
          Plus,
          Brush,
          Square,
          Hexagon,
          MinusCircle,
          Check,
          X,
          Download,
          FolderEdit } from 'lucide-svelte';

  // import OpenSeadragon from 'openseadragon';
  // import * as Annotorious from '@recogito/annotorious-openseadragon';

  import '@recogito/annotorious-openseadragon/dist/annotorious.min.css';

  let selectedImg;

  let drawSelectOpen = true;

  let annoCols = ['id', 'date', 'created_by', 'object_category', 'object_name']
  let addingCol = false;
  let newColName = '';

  let OpenSeadragon;
  let Annotorious;
  let SelectorPack;
  let ShpLbl;

  let zoomIn;
  let zoomOut;
  let reset;

  let viewer;
  let anno;

  let fileInput;
  let fpInput;
  
  onMount(async () => {
    OpenSeadragon = await import('openseadragon');
    Annotorious = (await import('@recogito/annotorious-openseadragon')).default;
    SelectorPack = (await import('@recogito/annotorious-selector-pack')).default;
    ShpLbl = (await import('@recogito/annotorious-shape-labels')).default;

    viewer = new OpenSeadragon.Viewer({
      id: 'openseadragon',
      zoomInButton: zoomIn,
      zoomOutButton: zoomOut,
      homeButton: reset,
      maxZoomPixelRatio: Infinity
    });

    const config = {
        formatter: ShpLbl(),
        allowEmpty: true,
        widgets: []
    }; 

    anno = Annotorious(viewer, config);

    new SelectorPack(anno, { 
        tools: ['polygon']
    });

    initAnnoCanvas()

  });

  $: console.log($projectSavePath)

  $: console.log($projectData[index])

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

    let final_fp = fp.join(sep) + sep;
    return(final_fp)
  }

  const onDirSelected=(e)=> {
    $projectSavePath = getFilePath(e.target.files[0]['path']);
  }

  const onFileSelected=(e)=> {
    if ($projectSavePath == "") {
      $projectSavePath = getFilePath(e.target.files[0]['path']);
    }

    for (let i = 0; i < e.target.files.length; i++) {
			let image = e.target.files[i];
      let reader = new FileReader();
      reader.readAsDataURL(image);

      reader.onload = e => {
                            ExifReader.load(e.target.result).then(function (tags) {
                              setFileData(image['name'], e.target.result, tags);
                            });
                            
                            };
      
    }
    
  }

  function setFileData(filename, filepath, exifTags) {
    console.log(exifTags)
    $projectData = [...$projectData, {'name': filename, 
                                        'filepath': filepath,
                                        'annotations': [],
                                        'shpInfo': {},
                                        'exifInfo': exifTags
                                      }];
    $dataAdded = true;                                   
  }

  function deleteFile() {
    if ($projectData.length > 1) {
      let deleteFilePosition = index;
      
      anno.clearAnnotations();
      $projectData.splice(deleteFilePosition, 1);
      $projectData = $projectData;    

      if (deleteFilePosition == $projectData.length) {
        index = deleteFilePosition - 1;
      } else {
        index = deleteFilePosition;
      }

      console.log(index)
      selectedImg = Object.entries($projectData)[index][1]['filepath'];
      restoreAnnos()
    }

    console.log($projectData)
  }
  
  // information on annotation shapes should be stored separately --> annotation info and shapes will always correspond by position
  // upon save or export, shape info can be added, then deleted on reload
  function initAnnoCanvas() {
    anno.setDrawingTool('rect');
    console.log("anno init")
    // anno.saveSelected();
    let currRow = 0;
    anno.on('createSelection', function(selection) {
      anno.saveSelected();
    });

    anno.on('createAnnotation', function(annotation, overrideId) {
      console.log("created!")      
      let rowID = 'anno_' + currRow;
      
      annotation['coref_id'] = rowID;
      console.log(annotation)
      
      addRow(rowID);

      saveAnnos();
      currRow++;
    });

    anno.on('deleteAnnotation', function(annotation) {
      console.log(annotation)
      let deletePosition;
      for (let i = 0; i < $projectData[index]['annotations'].length; i++) {
        if ($projectData[index]['annotations'][i]['id'] === annotation["coref_id"]) {
          console.log(i)
          deletePosition = i;
        }
      }
      $projectData[index]['annotations'].splice(deletePosition, 1);
      $projectData[index]['shpInfo'].splice(deletePosition, 1);


      $projectData[index]['annotations'] = $projectData[index]['annotations'];
      $projectData[index]['shpInfo'] = $projectData[index]['shpInfo'];

      console.log("deleted")
    });

  }

  function addRow(rowID) {
    let colDict = {}
    for (let i = 0; i < annoCols.length; i++) {
      if (annoCols[i] == 'id') {
        colDict[annoCols[i]] = rowID
      } else if (annoCols[i] == 'date') {
        colDict[annoCols[i]] = getDate()
      } else {
        colDict[annoCols[i]] = ''
      }
    }
    $projectData[index]['annotations'] = [...$projectData[index]['annotations'], colDict]
  }

  function getDate() {
    let newDate = new Date();
    let currentDate = newDate.getDate() + "/"
                + (newDate.getMonth()+1)  + "/" 
                + newDate.getFullYear() + "@"  
                + newDate.getHours() + ":"  
                + newDate.getMinutes() + ":" 
                + newDate.getSeconds();
  
    return(currentDate);
  }

  const scrollToBottom = node => {
		const scroll = () => node.scroll({
			top: node.scrollHeight,
			behavior: 'smooth',
		});
		scroll();

		return { update: scroll }
	};

  // toolbar
  // TODO: SOMETIMES when this is clicked, drawing annotations seems to be disabled
  function setAnnoShp(tool) {
    console.log("Set to " + tool)
    anno.setDrawingTool(tool);
  }

  function saveAnnos() {
    Object.entries($projectData)[index][1]['shpInfo'] = anno.getAnnotations()
  }

  function restoreAnnos() {
    if (Object.entries($projectData)[index][1]['shpInfo'].length != 0) {
      let count = 0;
      for (let i = 0; i < Object.entries($projectData)[index][1]['shpInfo'].length; i++) {
        anno.addAnnotation(Object.entries($projectData)[index][1]['shpInfo'][i]);
              count += 1;
      }
    }
  }

  function addColumn() {
    annoCols = [...annoCols, newColName];
    
    for (let i = 0; i < $projectData.length; i++) {
      for (let j = 0; j < $projectData[i]['annotations'].length; j++)
      $projectData[i]['annotations'][j][newColName] = [''];
    }

    $projectData =  $projectData;
    addingCol = false;
    newColName = '';
    console.log($projectData[index]['annotations'])
    console.log("added col")
  }

  function removeColumn(colPosition) {
    for (let i = 0; i < $projectData.length; i++) {
      for (let j = 0; j < $projectData[i]['annotations'].length; j++) {
        delete $projectData[i]['annotations'][j][annoCols[colPosition]];
      }
    }

    $projectData = $projectData;

    annoCols.splice(colPosition, 1);
    annoCols = annoCols;
  }

  // $: if ($dataAdded && selectedImg == null) {
  //     selectedImg = Object.entries($projectData)[0][1]['filepath'];
  //     setView();
  //   } else {
  //     setView();
  //   }


  // function setView() {
  //   if (viewer !== undefined) {
  //     viewer.open({
  //             type: 'image',
  //             url: selectedImg,
  //         });
  //   } else {
  //     console.log("viewer undefined")
  //   }
  // }

  $: if (viewer !== undefined) {
    if ($dataAdded && selectedImg == null) {
      selectedImg = Object.entries($projectData)[0][1]['filepath'];
      viewer.open({
              type: 'image',
              url: selectedImg,
          });
    } else if ($dataAdded) {
      viewer.open({
              type: 'image',
              url: selectedImg,
          });
    }
  }


  // navigating imgs
  let index = 0;

  function jump_to_img(img) {
    saveAnnos()
    anno.clearAnnotations();

    index = img[0];
    selectedImg = Object.entries($projectData)[index][1]['filepath'];
    console.log(img)
    console.log(index)
    restoreAnnos()
  }

  function prevImg() {
    saveAnnos()
    anno.clearAnnotations();

    if ($projectData.length > 0) {
      if (index != 0) {
        index--;
        console.log(index)
        selectedImg = Object.entries($projectData)[index][1]['filepath'];
      } else {
        index = Object.entries($projectData).length - 1;
        selectedImg = Object.entries($projectData)[index][1]['filepath'];
      }
    }

    console.log(index)
    restoreAnnos()
    console.log("prev!")
  }

  function nextImg() {
    saveAnnos()
    anno.clearAnnotations();

    if ($projectData.length > 0) {
      if (index != Object.entries($projectData).length - 1) {
        console.log(index)
        index++;
        console.log(index)
        selectedImg = Object.entries($projectData)[index][1]['filepath'];
      } else {
        index = 0;
        selectedImg = Object.entries($projectData)[index][1]['filepath'];
      }
    }
    
    console.log(index)
    restoreAnnos()
    console.log("next!")
  }

  let selectedFilter = 'All images';
  let filterOptions = [
                        'All images',
                        'Images with annotations',
                        'Images without annotations'
                      ];

  let searchTerm = '';
  let searchConfirm = false;

  $: if (searchTerm) {
    console.log(searchTerm)
  }

  let selectedExportFormat;
  let exportFormats = [
                        'COCO',
                        'PascalVOC',
                        'YOLO'
                      ]

  function downloadAs() {
    if (selectedExportFormat == 'COCO') {
      toCOCO();
    } else if (selectedExportFormat == 'PascalVOC') {
      toPascalVOC();
    } else if (selectedExportFormat == 'YOLO') {
      toYOLO();
    }

  }

  function toCOCO() {
    let saveCOCO = {
                  'info': {},
                  'licenses': [],
                  'images': [],
                  'categories': [],
                  'annotations': [],
                };

    saveCOCO['info'] = {
                        'year': 2023,
                        'version': 'v1.0',
                        'description': 'MA object detection dataset',
                        'contributor': 'MA',
                        'url': 'https://github.com/ChantalMB/issap-image-annotator',
                        'date_created': '2023-06-01T09:30'
                      };

    saveCOCO['licenses'].push({
                              'url': 'https://creativecommons.org/licenses/by-nc/4.0/',
                              'id': 1,
                              'name': 'Attribution-NonCommercial'
                              });
                              
    let uniqueCates = new Set(); 
    let annoCount = 0;
    for (let i = 0; i < $projectData.length; i++) {
      let img = new Image();
      img.src = $projectData[i]['filepath'];
                          
      saveCOCO['images'].push({
                            "id": Number(i), 
                            "width": img.width, 
                            "height": img.height, 
                            "file_name": $projectData[i]['filepath'], 
                            "license": 1, 
                            "date_captured": getDate(),
                            });
      
      if ($projectData[i]['annotations'] !== []) {
        for (let j = 0; j < $projectData[i]['annotations'].length; j++) {
          uniqueCates.add([$projectData[i]['annotations'][j]["object_name"], $projectData[i]['annotations'][j]["object_category"]].toString())

          let coords = Object.values($projectData[i]['shpInfo'])[j].target.selector.value
          if (Object.values($projectData[i]['shpInfo'])[j].target.selector.type === "FragmentSelector") {
            coords = coords.replace(/[^0-9\.]+/g," ");
            coords = coords.split(" ");
            coords.shift()

            let bbox = [];
            for (let n = 0; n < coords.length; n++) {
              coords[n] = Number(coords[n]);
              bbox.push(Number(coords[n]));
            }
            

            let xmax = Number(coords[0]) + Number(coords[2])
            let ymax = Number(coords[1]) + Number(coords[3])
            coords[2] = xmax;
            coords[3] = ymax;

            let calcArea = [[coords[0], coords[1]], [coords[0], coords[2]], [coords[3], coords[2]], [coords[3], coords[1]]];
            let segmentation = [coords[0], coords[1], coords[0], coords[2], coords[3], coords[2], coords[3], coords[1]];
            saveCOCO['annotations'].push({
                                        "segmentation": [segmentation],
                                        "area": area(calcArea),
                                        "iscrowd": 0,
                                        "image_id": i,
                                        "bbox": bbox,
                                        "category_id": 0,
                                        "id": annoCount,
                                        'tempNm': $projectData[i]['annotations'][j]["object_name"],
                                      });

          } else {
            let x = [];
            let y = [];
            coords = coords.replace(/[^0-9.,]/g," ");
            coords = coords.split(" ");
            coords = coords.filter(Boolean);

            let segmentation = [];
            let calcArea = [];
            for (let n = 0; n < coords.length; n++) {
              let sep = coords[n].split(",")
              x.push(sep[0])
              y.push(sep[1])

              segmentation.push(Number(sep[0]));           
              segmentation.push(Number(sep[1]));

              calcArea.push([Number(sep[0]), Number(sep[1])])
            }


            let w = Math.max(...x) - Math.min(...x)
            let h = Math.max(...y) - Math.min(...y)

            let bbox = [Math.min(...x), Math.min(...y), w, h]

            saveCOCO['annotations'].push({
                                        "segmentation": [segmentation],
                                        "area": area(calcArea),
                                        "iscrowd": 0,
                                        "image_id": i,
                                        "bbox": bbox,
                                        "category_id": 0,
                                        "id": annoCount,
                                        'tempNm': $projectData[i]['annotations'][j]["object_name"],
                                      });

          }
          annoCount += 1;

        }

      }
    }

    let cateCount = 0
    for (let item of uniqueCates) {
      let cateRef = item.split(",");
      saveCOCO['categories'].push({
                                  'supercategory': cateRef[1], 
                                  'id': cateCount, 
                                  'name': cateRef[0],
                                })
      cateCount += 1;                           
    }
    
    for (let c = 0; c < saveCOCO['annotations'].length; c++) {
      let obj = saveCOCO['categories'].find(o => o.name === saveCOCO['annotations'][c].tempNm);
      saveCOCO['annotations'][c].category_id = obj.id;

      delete saveCOCO['annotations'][c].tempNm;
    }

    let zip = new JSZip();

    let annotatedData = zip.folder("annotations");
    annotatedData.file('COCO_annotation_data.json', JSON.stringify(saveCOCO))
    // TO DO: get images to export with data
    // for (let i = 0; i < $projectData.length; i++) {
    //   // annotatedData.file($projectData[i]['name'], create_img_file($projectData[i]['filepath']));
    // }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "project_data_COCO.zip");
    }); 
    
  }


  function toYOLO() {
    let uniqueCates = new Set();
    let annoTxtFiles = {}
    let correspondingImgs = []
    for (let i = 0; i < $projectData.length; i++) {
      console.log($projectData[i])
      let listOfAnnos = []
      let img_w = $projectData[i]['exifInfo']['Image Width']['value'];
      let img_h = $projectData[i]['exifInfo']['Image Height']['value'];

      for (let j = 0; j < $projectData[i]['annotations'].length; j++) {
        uniqueCates.add($projectData[i]['annotations'][j]['object_category'])
        let coords = $projectData[i]['shpInfo'][j].target.selector.value;
        coords = coords.match(/[\d.]+/g);

        coords = coords.map(item => parseFloat(item))

        let xcenter = (coords[0] + coords[2]/2) / img_w
        let ycenter = (coords[1] + coords[3]/2) / img_h
        let w = coords[2] / img_w
        let h = coords[3] / img_h

        let bbox_obj = {
                        'class': $projectData[i]['annotations'][j]['object_category'],
                        'xc': xcenter,
                        'yc': ycenter,
                        'w': w,
                        'h': h
                       }

        listOfAnnos.push(bbox_obj)
      }
      annoTxtFiles[$projectData[i]["name"]] = listOfAnnos
      correspondingImgs = [...correspondingImgs, $projectData[i]['filepath']]
    }

    let uniqueCatesArr = Array.from(uniqueCates)
    console.log(uniqueCatesArr)

    let zip = new JSZip();

    let annotatedData = zip.folder("project_data_yolo");

    let datayaml = `train: [path/to/training_images]\nval: [path/to/val_images]\ntest: [path/to/test_images]\n\nnc: ${uniqueCatesArr.length}\nnames: ${JSON.stringify(uniqueCatesArr)}`
    
    annotatedData.file('data.yaml', datayaml)

    for (let i = 0; i < Object.entries(annoTxtFiles).length; i++) {
      let annoFileName = Object.entries(annoTxtFiles)[i][0]
      annoFileName = annoFileName.substring(0, annoFileName.lastIndexOf("."))
      console.log(annoFileName)

      let annoFile = ""
      for (let j = 0; j < Object.entries(annoTxtFiles)[i][1].length; j++) {
        let classNum = uniqueCatesArr.indexOf(Object.entries(annoTxtFiles)[i][1][j]['class']);
        console.log(Object.entries(annoTxtFiles)[i][1][j])

        annoFile += `${classNum} ${Object.entries(annoTxtFiles)[i][1][j]['xc']} ${Object.entries(annoTxtFiles)[i][1][j]['yc']} ${Object.entries(annoTxtFiles)[i][1][j]['w']} ${Object.entries(annoTxtFiles)[i][1][j]['h']} \n`

      }
      annotatedData.file("annotations/" + annoFileName + '.txt', annoFile)

      let uri = correspondingImgs[i];
      let idx = uri.indexOf('base64,') + 'base64,'.length;
      let content = uri.substring(idx);
      annotatedData.file("images/" + annoFileName + ".png", content, {base64: true})
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "project_data_yolo.zip");
    });             

  }

  function toPascalVOC() { 
    let ctxtForFilename = [];
    let totalImgs = [];

    for (let i = 0; i < $projectData.length; i++) {
      let img = new Image();
      img.src = $projectData[i]['filepath'];

      let ref = Object.keys($projectData)[i]
      ctxtForFilename.push($projectData[i]['name'])

    // why yes I AM creating XML the dirty way
    // we don't talk about it
      let base = `<annotation>
  <folder>iss_images</folder>
  <filename>${$projectData[i]['name']}</filename>
  <path>${$projectData[i]['filepath']}</path>
  <source>
    <database>Unknown</database>
  </source>
  <size>
    <width>${img.width}</width>
    <height>${img.height}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>`;

    if ($projectData[i]['annotations'] !== []) {
      for (let j = 0; j < $projectData[i]['annotations'].length; j++) {
          let coords = Object.values($projectData[i]['shpInfo'])[j].target.selector.value;
          let obj;

          if (Object.values($projectData[i]['shpInfo'])[j].target.selector.type === "FragmentSelector") {
            coords = coords.replace(/[^0-9\.]+/g," ");
            coords = coords.split(" ");
            coords.shift();

            let xmax = Number(coords[0]) + Number(coords[2])
            let ymax = Number(coords[1]) + Number(coords[3])
            coords[2] = xmax;
            coords[3] = ymax;
          
          } else {
            let x = [];
            let y = [];
            coords = coords.replace(/[^0-9.,]/g," ");
            coords = coords.split(" ");
            coords = coords.filter(Boolean);

            for (let n = 0; n < coords.length; n++) {
              let sep = coords[n].split(",")
              x.push(sep[0])
              y.push(sep[1])

            }    
            coords = [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)]
          }

          obj = `
  <object>
    <name>${$projectData[i]['annotations'][j]['object_category']}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${coords[0]}</xmin>
      <ymin>${coords[1]}</ymin>
      <xmax>${coords[2]}</xmax>
      <ymax>${coords[3]}</ymax>
    </bndbox>
  </object>`;  

          base += obj;
        }
      }
      base += `
  </annotation>`;

      totalImgs.push(base)
    }
    var zip = new JSZip();

    var annotatedData = zip.folder("annotations");
    for (let i = 0; i < totalImgs.length; i++) {
      let fn = ctxtForFilename[i] + ".xml"
      annotatedData.file(fn, totalImgs[i]);
    }

    // var baseImgs = zip.folder("images");
    // for (let i = 0; i < totalImgs.length; i++) {
    //   baseImgs.file($infoStore[Object.keys($infoStore)[i]][0].filename, create_img_file($infoStore[Object.keys($infoStore)[i]][0].filename));
    // }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "project_data_pascal_voc.zip");
    });

  }

  async function create_img_file(pathName) {
    let response = await fetch(pathName);
    let data = await response.blob();
    let metadata = {
      type: 'image/jpeg'
    };
    let file = new File([data], "test.jpg", metadata);
    return file;
  }

  let typeCategory = [];
  function updateCategory(val) {
      if (typeCategory.indexOf(val) === -1) {
          typeCategory = [...typeCategory, val]
      }
  }

  // manage keypresses
  function handleKeypress(event) {
    // console.log("key pressed!")
    if (event['key'] == 'ArrowLeft') {
      prevImg();
    }

    if (event['key'] == 'ArrowRight') {
      nextImg();
    }
    // console.log(event['key'])
  }


  let total;

  const replacer = (key, value) => {
    if (Array.isArray(value) && (key === 'annotations' || key === 'shpInfo')) {
      return JSON.stringify(value);
    }
    return value;
  };

  async function saveProject() {
    let req = {}
    req[$projectSavePath] = $projectData;

    const response = await fetch('/api/workspace', {
        method: 'POST',
        body: JSON.stringify({req}, replacer, 2),
        headers: {
            'content-type': 'application/json'
        }
    });

    total = await response.json(); 
    console.log(total)
  }

  $: if ($projectDataLoaded && anno != undefined) {
    console.log("reached")
    restoreAnnos();
    $projectDataLoaded = false;
  }

  function homeReset() {
    saveProject();

    $projectData = [];
    $projectSavePath = "";
    $dataAdded = false;
  }

  function getFormattedMetadata(metadata) {
    console.log(metadata)
    let metadataFormatted;
    if (metadata["UserComment"] !== undefined) {
      if (typeof metadata["UserComment"]["value"] == "string") {
        metadataFormatted = JSON.parse(metadata["UserComment"]["value"]);
      } else {
        metadataFormatted = metadata["UserComment"]["value"];
      }
    }
    
    for (let i = 0; i < Object.entries(metadata).length; i++) {
      if (Object.entries(metadata)[i][0] !== "UserComment") {
        metadataFormatted[Object.entries(metadata)[i][0]] = Object.entries(metadata)[i][1]["value"]
      }
    }

    return(Object.entries(metadataFormatted))
  }

</script>

<svelte:window on:keydown={handleKeypress}/>

<div class="workspace">

  <div class="navigation">
    <div class="base_buttons">
      <button class="nav_button" on:click={()=> homeReset()}><a href="/"><Home size="15"/></a></button>
      <button class="nav_button" on:click={()=> saveProject()}><Save size="15"/></button>
      <button class="nav_button" on:click={()=>{fpInput.click();}}>
        <FolderEdit size="15"/>
        <input style="display:none" type="file" webkitdirectory on:change={(e)=>onDirSelected(e)} bind:this={fpInput}>
      </button>
    </div>
    
    <div class="mod_files">
      <span>Images</span>

      <div class="mod_files_buttons">
        <button class="nav_button" on:click={()=>{fileInput.click();}}>
          <ImagePlus size="15"/>
          <input style="display:none" type="file" accept="image/*" multiple on:change={(e)=>onFileSelected(e)} bind:this={fileInput}>
        </button>
        <button class="nav_button" on:click={()=> deleteFile()}><ImageMinus size="15"/></button>
      </div>
    </div>

    <div class="file_viewer">
      <ul>
        {#if $dataAdded}
        {#each Object.entries($projectData) as img}
          {#if index == img[0]}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="selected" on:click={()=> jump_to_img(img)} id="file_list">{img[1]["name"]}</li>
          {:else if selectedFilter == 'Images with annotations' && img[1]["annotations"].length > 0}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="highlight" on:click={()=> jump_to_img(img)} id="file_list">{img[1]["name"]}</li>
          {:else if selectedFilter == 'Images without annotations' && img[1]["annotations"].length === 0}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="highlight" on:click={()=> jump_to_img(img)} id="file_list">{img[1]["name"]}</li>
          {:else if searchTerm.length > 0 && String(img[1]).includes(searchTerm)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="highlight" on:click={()=> jump_to_img(img)} id="file_list">{img[1]["name"]}</li>
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li on:click={()=> jump_to_img(img)} id="file_list">{img[1]["name"]}</li>
          {/if}
        {/each}
        {/if}
      </ul>
    </div>

    <div class="filter">
      <hr />

      <div>
        <span>Filter: </span>
        <select bind:value={selectedFilter}>
          {#each filterOptions as value}
          <option {value}>{value}</option>
          {/each}
        </select>
      </div>

      <hr />

      <div>
        <span>Search annotation metadata: </span>
        <input type="text" bind:value={searchTerm}>
        <!-- <button on:click={() => (searchConfirm = true)}>ok</button> -->
      </div>
    </div>

    <div class="export">     
      <hr />
 
      <span>Export as: </span>
      <select bind:value={selectedExportFormat}>
        {#each exportFormats as value}
        <option {value}>{value}</option>
        {/each}
      </select>
      <button on:click={() => downloadAs()}><Download size="15"/></button>
    </div>

    <div class="instructions">
      <!-- for instructions -->
    </div>

  </div>
  
  <div class="annotator">
    <div id="openseadragon"></div>
    <div class="anno_buttons"> 
      <!-- <button class="anno_button" on:click={() => (drawSelectOpen = !drawSelectOpen)}><Brush size="15"/></button> -->
      <button class="draw_tool" on:click={() => setAnnoShp('rect')}><Square size="15"/></button>
      <button class="draw_tool" on:click={() => setAnnoShp('polygon')}><Hexagon size="15"/></button>
      <!-- {#if drawSelectOpen}
        <div class="draw_tools" transition:slide>
        </div>
      {/if} -->
      <button class="anno_button" bind:this={zoomIn}><ZoomIn size="15"/></button>
      <button class="anno_button" bind:this={zoomOut}><ZoomOut size="15"/></button>
      <button class="anno_button" bind:this={reset}><RefreshCcw size="15"/></button>
    </div> 

    <div class="page_buttons">
      <button on:click={prevImg} class="page_button"><ChevronLeft size="15"/></button>
      <button on:click={nextImg} class="page_button"><ChevronRight size="15"/></button>
    </div>
  </div>


  <div class="data-viewer">
    <input class="radio" id="anno" name="group" type="radio" checked>
    <input class="radio" id="md" name="group" type="radio">
  
    <div class="tabs">
      <label class="tab" id="anno-tab" for="anno">Annotations</label>
      <label class="tab" id="md-tab" for="md">Metadata</label>
    </div>


    {#if $dataAdded}
    <div use:scrollToBottom={$projectData[index]['annotations']} class="panels">
      <div class="panel" id="anno-panel">
        <table>
          <tr>
            {#each annoCols as col, i}
            {#if i <= 4}
              <th>{col}</th>
            {:else}
              <th>{col} <button class="rmCol" on:click={() => removeColumn(i)}><MinusCircle size="15"/></button></th>
            {/if}
            {/each}
            {#if addingCol}
              <th>
                <input class="newColName" type="text" bind:value={newColName}>
                <button class="confirmCol" on:click={() => addColumn()}><Check size="21"/></button>
                <button class="cancelCol" on:click={() => (addingCol = false)}><X size="21"/></button>
              </th>
            {/if}
          </tr>
          {#if $projectData[index]['annotations'].length != 0}
          {#each $projectData[index]['annotations'] as row, i}
          <tr>
            {#if row != null}
              {#each Object.entries(row) as item}
                {#if item[0] == "id" || item[0] == "date"}
                <td>{item[1]}</td>
                {:else if item[0] == "created_by" || item[0] == "object_category"}
                <td>
                  <input id="datalist" list="type_list" type="text" on:change={()=> updateCategory($projectData[index]['annotations'][i][item[0]])} bind:value={$projectData[index]['annotations'][i][item[0]]}>
                  <datalist id="type_list">
                    {#each typeCategory as c}
                        <option value={c}>
                    {/each}
                </datalist>
                </td>
                {:else}
                <td><textarea bind:value={$projectData[index]['annotations'][i][item[0]]}></textarea></td>
                {/if}
              {/each}
            {/if}
          </tr>
          {/each}
          {/if}
        </table>
        <div class="addCol">
          <button on:click={() => (addingCol = true)}><Plus /></button>
        </div>
      </div>

      <div class="panel" id="md-panel">
        {#each getFormattedMetadata($projectData[index]["exifInfo"]) as exifInfo}
          <b>{exifInfo[0]}:</b> {exifInfo[1]}
          <hr />
        {/each}

      </div>
    </div>
    {:else}
    <div class="panels">
      <div class="panel" id="anno-panel">
        <table>
          <tr>
            {#each annoCols as col, i}
            {#if i <= 4}
              <th>{col}</th>
            {:else}
              <th>{col} <button class="rmCol" on:click={() => removeColumn(i)}><MinusCircle size="15"/></button></th>
            {/if}
            {/each}
            {#if addingCol}
              <th>
                <input class="newColName" type="text" bind:value={newColName}>
                <button class="confirmCol" on:click={() => addColumn()}><Check size="21"/></button>
                <button class="cancelCol" on:click={() => (addingCol = false)}><X size="21"/></button>
              </th>
            {/if}
          </tr>
        </table>
        <div class="addCol">
          <button on:click={() => (addingCol = true)}><Plus /></button>
        </div>
      </div>

      <div class="panel" id="md-panel">
        <p>Waiting for file upload...</p>
      </div>
    </div>
    {/if}

  </div>

</div>


<style>

  /* navigation window */

  .navigation {
    border-left: 1px solid black; 
    height: 100vh;
    width: 19vw;
    float: right;
    display: flex;
    flex-direction: column;
  }

  .nav_button {
    background-color: transparent;
    border: 0px;
    padding: 0px;
  }

  .base_buttons, .mod_files {
    padding: 7px;
  }

  .mod_files span {

  }

  .mod_files_buttons {
    float: right;
    align-items: center;
  }

  .file_viewer {
    height: 35vh;
    display:block; 
    font-size:small; 
    overflow: scroll; 
    min-height: 10rem; 
    max-height: 25rem;
    
  }

  .file_viewer ul {
    position: relative; 
    line-height: 1.3em; 
    margin: 0; 
    padding: 3px 15px 15px 15px; 
    list-style-type: none;
  }

  .file_viewer li {
    white-space: nowrap; 
    display: block; 
    padding: 0 0.4rem;
    border-left: 0.2rem solid grey; 

  }

  .file_viewer li:hover { 
    background-color: #d5e5ff; 
    cursor: pointer; 
  }

  .selected {
    border-left: 0.2rem solid black !important; 
    font-weight: bold;
  }

  .highlight {
    background-color: yellow;
  }

  .filter {
    position: relative; 
    line-height: 1.3em; 
    margin: 0; 
    padding: 7px; 
  }

  .export {
    position: relative; 
    line-height: 1.3em; 
    margin: 0; 
    padding: 7px; 
  }

  .export button {
    border: 0px;
    background-color: transparent;
  }

  .export button:hover {
    color: lightblue;
  }

  /* annotation canvas */

  .annotator {
    height: 75vh;
    display: flex;
    position: relative;
    border-bottom: 1px solid black; 

  }

  #openseadragon {
    z-index: 1;
    flex: 1;
  }

  .draw_tools {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .draw_tool {
    border-radius: 50%;
    border: 0px;
    box-shadow: 0 0.3rem 0.5rem #00000080;
    background-color: white;
    height: 30px;
    width: 30px;
    margin: 5px;
  }

  .anno_buttons {
    z-index: 2;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

  }

  .anno_button {
    border-radius: 50%;
    border: 0px;
    box-shadow: 0 0.3rem 0.5rem #00000080;
    background-color: white;
    height: 30px;
    width: 30px;
    margin: 5px;
  }

  .page_buttons {
    z-index: 2;
    position: absolute;
    display: flex;
    bottom: 0;
    right: 0;
    margin: 5px 5px 3px 5px;
  }

  .page_button {
    border-radius: 50%;
    border: 0px;
    background-color: white;
    box-shadow: 0 0.3rem 0.5rem #00000080;
    height: 30px;
    width: 30px;
    margin: 5px;
  }
  
  /* data viewer styling */

  .data-viewer {
    height: 27vh;
    margin-top: -3.1vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .tabs {
    z-index: 3;
    margin-left: 10px;

  }

  .tab {
    cursor: pointer;
    padding: 3px 10px;
    margin: 0px 2px;
    background: black;
    display: inline-block;
    color: #fff;
    border-radius: 3px 3px 0px 0px;
    box-shadow: 0 0.3rem 0.5rem #00000080;
  }

  .panels {
    z-index: 4;
    background: #fff;
    /* border-radius: 3px; */
    height: 100%;
    padding: 20px;
    padding-right: 7px;
    overflow: scroll;
  }


  .panel {
    display: none;
  }

  .panel-title {
    font-size: 1.5em;
    font-weight: bold;
  }

  .radio {
    display: none;
  }

  #anno:checked ~ .panels #anno-panel,
  #md:checked ~ .panels #md-panel {
    display: block;
  }

  #anno:checked ~ .tabs #anno-tab,
  #md:checked ~ .tabs #md-tab {
    background: #fff;
    color: #000;
    border-top: 3px solid black;
  }

  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 95%;
    float: left;
  }

  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }

  .addCol {
    float: right;
    position: absolute;
    top: 47px;
    right: 10px;

  }

  .addCol button {
    border: 0px;
    background-color: transparent;
    height: 30px;
    width: 30px;
    margin: 5px;
  }

  .newColName {
    display: inline-block;
  }

  .confirmCol {
    float: right;
    border: 0px;
    background-color: transparent;
    display: flex;
    align-items: center;

  }

  .cancelCol {
    float: right;
    border: 0px;
    background-color: transparent;
    display: flex;
    align-items: center;
  }

  .confirmCol:hover {
    color: green;
  }

  .cancelCol:hover {
    color: red;
  }


  .rmCol {
    border: 0px;
    background-color: transparent;
    padding: 0px;
    display: flex;
    align-items: center;
    float: right;
  }


</style>

