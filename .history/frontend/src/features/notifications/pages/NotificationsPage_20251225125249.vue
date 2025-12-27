<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Notifications
    </h2>
    <p class="text-gray-500 mb-6">
      Manage your notification preferences
    </p>

    <div class="space-y-4">
      <div
        class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between"
      >
        <div>
          <p class="font-semibold text-gray-900">Study Reminder</p>
          <p class="text-sm text-gray-600">
            Time for your daily React study session!
          </p>
          <p class="text-xs text-gray-400 mt-1">
            23/12/2024, 17:00
          </p>
        </div>
        <span class="h-3 w-3 rounded-full bg-blue-600 mt-1"></span>
      </div>

      <div
        class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between"
      >
        <div>
          <p class="font-semibold text-gray-900">Achievement Unlocked</p>
          <p class="text-sm text-gray-600">
            You completed 3 lessons this week!
          </p>
          <p class="text-xs text-gray-400 mt-1">
            23/12/2024, 02:00
          </p>
        </div>
        <span class="h-3 w-3 rounded-full bg-blue-600 mt-1"></span>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-xl p-4"
      >
        <p class="font-semibold text-gray-900">New Course Available</p>
        <p class="text-sm text-gray-600">
          UI/UX Design Principles has been added.
        </p>
        <p class="text-xs text-gray-400 mt-1">
          21/12/2024, 20:00
        </p>
      </div>
    </div>
  </div>
</template>
