<script lang="ts">
	import type { PageData } from "./$types";
    let {data} : {data:PageData} = $props();
</script>

<div>
    {#each data.data as form, idx}
        <span>Data {idx+1} : {form.code} </span>
    {/each}
</div>