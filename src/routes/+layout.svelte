<script lang="ts">
	import { goto } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';

	let { children, data } = $props();

</script>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<Toaster richColors position="top-right"></Toaster>

{@render children?.()}
