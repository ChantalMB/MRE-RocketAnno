<script>
    import { X } from 'lucide-svelte';
	import { disableWorkspace } from '../stores.js';


	export let showNewModal; // boolean

	let dialog; // HTMLDialogElement

	function quit() {
		dialog.close()
		$disableWorkspace = true;
	}

	$: if (dialog && showNewModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showNewModal = false)}
	on:click|self={() => dialog.close()}>

	<div on:click|stopPropagation>
        <!-- svelte-ignore a11y-autofocus -->
        <button class="quit" autofocus on:click={() => quit()}><X size="17"/></button>
		<slot name="header" />
		<hr />
		<slot />
	</div>
	
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	dialog > div {
		padding: 1em;
	}

	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
    
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	button {
		display: block;
	}

    .quit {
        border: 0px;
        background-color: transparent;
        float: right;
    }
</style>
