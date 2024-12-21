<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<Accordion.Root
	type="single"
	class="mx-auto my-auto flex w-[700px] flex-col justify-center sm:max-w-[30%] md:max-w-[50%] lg:max-w-[100%]"
>
	<Accordion.Item value="item-1">
		<Accordion.Trigger>Pengambilan Form</Accordion.Trigger>
		<Accordion.Content>
			{#each data.data as form}
				<Card.Root class="my-5 flex w-full items-center justify-between">
					<Card.Header class="px-5 py-0">
						<Card.Title>{form.name}</Card.Title>
						<Card.Description>{form.description ?? 'Tidak Ada Penjelasan'}</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<div class="flex flex-col gap-0.5 items-center justify-center text-right">
							<Label>{form.code}</Label>
							<span
								><a
									href="#"
									class="group relative text-[#18272F] no-underline"
								>
									Download PDF
									<span
										class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
									></span>
								</a></span
							>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="item-2">
		<Accordion.Trigger>Pengajuan Form</Accordion.Trigger>
		<Accordion.Content>
			Yes. It comes with default styles that matches the other components' aesthetic.
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
