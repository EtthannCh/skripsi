<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { updateRoleSchema } from './change-role-schema';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data }: { data: PageData } = $props();

	let open = $state(false);
	let openRoleCombobox = $state(false);
	let openMajorCombobox = $state(false);

	let value = $state('');
	let roleValue = $state('');
	let majorValue = $state('');

	let triggerRef = $state<HTMLButtonElement>(null!);
	let triggerRefRole = $state<HTMLButtonElement>(null!);
	let triggerRefMajor = $state<HTMLButtonElement>(null!);

	let formLoading = $state(false);

	const form = superForm(data.form, {
		validators: zod(updateRoleSchema),
		invalidateAll: true,
		onResult: ({ result }) => {
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
			} else {
				toast.error('Invalid Form', {
					position: 'top-right',
					dismissable: true
				});
			}
			selectedEmailRoleId = '';
			selectedEmailMajorId = '';
			value = '';
			roleValue = '';
			majorValue = '';
			formLoading = false;
		},
		onSubmit: () => {
			formLoading = true;
		}
	});

	const selectedValue = $derived(data.emailList?.find((f) => f.id.toString() == value)?.email);
	const selectedRoleValue = $derived(
		data.roleList?.find((f) => f.id.toString() == roleValue)?.name
	);
	const selectedMajorValue = $derived(
		data.majorList?.find((v) => v.id.toString() == majorValue)?.name
	);

	let selectedEmailRoleId = $state('');
	let selectedEmailMajorId = $state('');

	function toTitleCase(str: string) {
		return str.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		);
	}

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

	function closeAndFocusTriggerMajor() {
		openMajorCombobox = false;
		tick().then(() => {
			triggerRefMajor.focus();
		});
	}

	const { form: formData, enhance } = form;
</script>

<div class="mx-auto mt-10 flex max-w-[50%] flex-col items-center justify-center gap-10 rounded-md bg-white p-10">
	{#if formLoading}
		<span>
			<SyncLoader color="#007bff" />
		</span>
	{/if}
	<form action="?/submit" method="post" use:enhance class="flex flex-col gap-5">
		<h1 class="mb-5 text-center text-3xl">Change Role</h1>
		<input type="hidden" name="roleId" bind:value={$formData.roleId} />
		<input type="hidden" name="email" bind:value={$formData.email} />
		<input type="hidden" name="majorId" bind:value={$formData.majorId} />
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<div class="flex flex-col gap-5">
					<Label class="text-xl"
						>Choose Email <span class="text-lg"
							>(Username : {toTitleCase(
								data.emailList.find((v) => v.email == selectedValue)?.username ?? ''
							)})</span
						></Label
					>

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
						<Popover.Content class="w-max p-0">
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
															selectedEmailRoleId = '';
															selectedEmailMajorId = '';
														} else {
															value = email.id.toString();
															$formData.email = value;
															selectedEmailRoleId = email.role_id;
															selectedEmailMajorId = email.major_id;
															console.log(email.major_id);
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
		<Separator class="bg-black"></Separator>
		<Form.Field {form} name="roleId">
			<Form.Control let:attrs>
				<div class="flex flex-col gap-5">
					<Label class="text-xl">Select new Role For this User</Label>
					<span
						>Selected User Current Role : {data.roleList.find(
							(v) => v.id == Number(selectedEmailRoleId)
						)?.name}</span
					>
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
		<Separator class="bg-black"></Separator>
		<Form.Field {form} name="majorId">
			<Form.Control let:attrs>
				<div class="flex flex-col gap-5">
					<Label class="text-xl">Choose Major</Label>
					<span
						>Selected User Current Major : {data.majorList.find(
							(v) => v.id == Number(selectedEmailMajorId)
						)?.name}</span
					>
					<Popover.Root bind:open={openMajorCombobox}>
						<Popover.Trigger bind:ref={triggerRefMajor}>
							{#snippet child({ props })}
								<Button
									variant="outline"
									class="w-full justify-between"
									{...props}
									role="combobox"
									aria-expanded={open}
								>
									{selectedMajorValue || 'Select Major...'}
									<ChevronsUpDown class="opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-[200px] p-0">
							<Command.Root>
								<Command.Input placeholder="Search Major..." />
								<Command.List>
									<Command.Empty>No Major Found</Command.Empty>
									<Command.Group>
										{#if data.majorList}
											{#each data.majorList as major}
												<Command.Item
													value={major.id.toString()}
													onSelect={() => {
														if (majorValue && majorValue == major.id.toString()) {
															majorValue = '';
														} else {
															majorValue = major.id.toString();
															$formData.majorId = majorValue;
														}
														closeAndFocusTriggerMajor();
													}}
												>
													<Check class={cn(value !== major.id.toString() && 'text-transparent')} />
													{major.name}
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
		<button class="my-5 rounded-md bg-uphButton p-2 text-white" type="submit"> Submit</button>
	</form>
</div>
