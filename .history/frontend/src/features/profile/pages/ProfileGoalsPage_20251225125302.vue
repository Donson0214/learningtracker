<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Profile & Goals
    </h2>
    <p class="text-gray-500 mb-6">
      Manage your profile and learning goals
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Profile -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-4">
          Profile Information
        </h3>

        <div class="flex justify-center mb-4">
          <div
            class="h-20 w-20 rounded-full bg-blue-600 text-white
                   flex items-center justify-center text-3xl"
          >
            👤
          </div>
        </div>

        <div class="space-y-3">
          <input class="w-full border rounded-lg px-3 py-2" value="Sarah Johnson" />
          <input class="w-full border rounded-lg px-3 py-2" value="sarah@example.com" />
          <input class="w-full border rounded-lg px-3 py-2" value="Tech Academy" />
        </div>

        <button
          class="mt-4 w-full border border-gray-300 rounded-lg
                 px-4 py-2 text-sm font-medium"
        >
          Edit Profile
        </button>
      </div>

      <!-- Goals -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-4">
          Study Goals
        </h3>

        <label class="text-sm text-gray-600">Weekly Study Goal (hours)</label>
        <input class="w-full border rounded-lg px-3 py-2 mb-4" value="10" />

        <button
          class="w-full bg-gray-900 text-white px-4 py-2 rounded-lg
                 text-sm font-medium hover:bg-gray-800"
        >
          Save Goals
        </button>
      </div>
    </div>
  </div>
</template>
