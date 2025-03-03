<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import SuperDebug, { superForm, message } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { updateRoleSchema } from './change-role-schema';
	import { toast } from 'svelte-sonner';
	import { SyncLoader } from 'svelte-loading-spinners';
	import * as Form from '$lib/components/ui/form';

	let { data }: { data: PageData } = $props();

	let open = $state(false);
	let openRoleCombobox = $state(false);
	let value = $state('');
	let roleValue = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);
	let triggerRefRole = $state<HTMLButtonElement>(null!);
	let formLoading = $state(false);

	const form = superForm(data.form, {
		validators: zod(updateRoleSchema),
		onResult: ({ result }) => {
            console.log(result);
            
			formLoading = false;
			if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-right',
					dismissable: true
				});
			} else if (result.type == 'failure') {
				toast.error(result.data?.message, {
					position: 'top-right',
					dismissable: true
				});
			}
		},
		onSubmit: () => {
			formLoading = true;
		}
	});

	const selectedValue = $derived(data.emailList?.find((f) => f.id.toString() == value)?.email);
	const selectedRoleValue = $derived(
		data.roleList?.find((f) => f.id.toString() == roleValue)?.name
	);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function closeAndFocusTriggerRole() {
		openRoleCombobox = false;
		tick().then(() => {
			triggerRefRole.focus();
		});
	}

	const { form: formData, enhance } = form;
</script>

<div class="mx-auto mt-10 flex max-w-[50%] flex-col items-center justify-center gap-10 rounded-md">
	{#if formLoading}
		<span>
			<SyncLoader color="#007bff" />
		</span>
	{/if}
	<form action="?/submit" method="post" use:enhance>
        <input type="hidden" name="roleId" bind:value={$formData.roleId}>
        <input type="hidden" name="email" bind:value={$formData.email}>
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<div class="flex flex-col gap-5">
					<Label>Choose Email</Label>
					<Popover.Root bind:open>
						<Popover.Trigger bind:ref={triggerRef}>
							{#snippet child({ props })}
								<Button
									variant="outline"
									class="w-full justify-between"
									{...props}
									role="combobox"
									aria-expanded={open}
								>
									{selectedValue || 'Select Email...'}
									<ChevronsUpDown class="opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-[200px] p-0">
							<Command.Root>
								<Command.Input placeholder="Search Email..." />
								<Command.List>
									<Command.Empty>No Email Found</Command.Empty>
									<Command.Group>
										{#if data.emailList}
											{#each data.emailList as email}
												<Command.Item
													value={email.email.toString()}
													onSelect={() => {
														if (value && value == email.id.toString()) {
															value = '';
														} else {
															value = email.id.toString();
															$formData.email = value;
														}
														closeAndFocusTrigger();
													}}
												>
													<Check class={cn(value !== email.id.toString() && 'text-transparent')} />
													{email.email}
												</Command.Item>
											{/each}
										{/if}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</div>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="roleId">
			<Form.Control let:attrs>
				<div class="flex flex-col gap-5">
					<Label>Select new Role For this User</Label>
					<Popover.Root bind:open={openRoleCombobox}>
						<Popover.Trigger bind:ref={triggerRefRole}>
							{#snippet child({ props })}
								<Button
									variant="outline"
									class="w-[200px] justify-between"
									{...props}
									role="combobox"
									aria-expanded={open}
								>
									{selectedRoleValue || 'Select Role...'}
									<ChevronsUpDown class="opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-[200px] p-0">
							<Command.Root>
								<Command.Input placeholder="Search Role..." />
								<Command.List>
									<Command.Empty>No Role Found</Command.Empty>
									<Command.Group>
										{#if data.roleList}
											{#each data.roleList as role}
												<Command.Item
													value={role.id.toString()}
													onSelect={() => {
														if (roleValue && roleValue == role.id.toString()) {
															roleValue = '';
														} else {
															roleValue = role.id.toString();
															$formData.roleId = roleValue;
														}
														closeAndFocusTriggerRole();
													}}
												>
													<Check
														class={cn(roleValue !== role.id.toString() && 'text-transparent')}
													/>
													{role.name}
												</Command.Item>
											{/each}
										{/if}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</div>
			</Form.Control>
		</Form.Field>
		<button class="my-5 rounded-md bg-uphButton p-2 text-white" type="submit"> Submit</button>
	</form>
</div>
