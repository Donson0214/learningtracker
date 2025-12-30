<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="font-sans text-gray-800">

    <!-- Top Bar -->
    <div class="bg-teal-700 text-white text-sm">
      <div class="max-w-7xl mx-auto flex justify-between px-6 py-2">
        <div>📧 support@ailearn.io | 📞 +01 234 567 890</div>
        <div class="space-x-4">
          <a href="#" class="hover:underline">Login</a>
          <a href="#" class="hover:underline">Register</a>
        </div>
      </div>
    </div>

    <!-- Navbar -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-teal-600 rounded-lg"></div>
          <span class="font-bold text-xl text-teal-700">AI Learn</span>
        </div>

        <nav class="hidden md:flex space-x-8 font-medium">
          <a href="#" class="hover:text-teal-600">Home</a>
          <a href="#" class="hover:text-teal-600">Courses</a>
          <a href="#" class="hover:text-teal-600">AI Study Plan</a>
          <a href="#" class="hover:text-teal-600">Tracker</a>
          <a href="#" class="hover:text-teal-600">Organization</a>
        </nav>

        <button class="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600">
          Get Started
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-teal-700 text-white">
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6 py-20 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold leading-tight">
            Learn Smarter with <br /> AI-Powered Study Plans
          </h1>
          <p class="mt-6 text-lg text-teal-100">
            Track progress, organize courses, and get personalized AI learning paths designed just for you.
          </p>
          <div class="mt-8 flex space-x-4">
            <button class="bg-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-orange-600">
              Start Learning
            </button>
            <button class="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-700">
              Explore Courses
            </button>
          </div>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b"
            class="rounded-xl shadow-lg"
            alt="Students learning"
          />
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 px-6 text-center">
        <div class="bg-white p-8 rounded-xl shadow">
          <h3 class="font-bold text-lg">📊 Learning Tracker</h3>
          <p class="mt-3 text-gray-600">
            Monitor progress, habits, and consistency across all your courses.
          </p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow">
          <h3 class="font-bold text-lg">🤖 AI Study Plans</h3>
          <p class="mt-3 text-gray-600">
            Smart schedules generated based on your goals, time, and performance.
          </p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow">
          <h3 class="font-bold text-lg">🗂 Organization</h3>
          <p class="mt-3 text-gray-600">
            Keep notes, tasks, and resources perfectly organized in one place.
          </p>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-center">
        <div class="grid grid-cols-2 gap-4">
          <img src="https://images.unsplash.com/photo-1600195077909-46e573870d99" class="rounded-lg" />
          <img src="https://images.unsplash.com/photo-1544717305-2782549b5136" class="rounded-lg" />
          <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df" class="rounded-lg col-span-2" />
        </div>

        <div>
          <h2 class="text-3xl font-bold">
            Leading the Future of <br /> AI-Driven Learning
          </h2>
          <p class="mt-6 text-gray-600">
            Our platform combines courses, progress tracking, and AI intelligence to help learners
            achieve goals faster and more effectively.
          </p>
          <p class="mt-4 text-gray-600">
            Designed for students, professionals, and organizations.
          </p>
          <button class="mt-6 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600">
            Learn More
          </button>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-teal-700 text-white py-16 text-center">
      <h2 class="text-3xl font-bold">Start Your AI Learning Journey Today</h2>
      <p class="mt-4 text-teal-100">
        Create your account and let AI guide your learning.
      </p>
      <button class="mt-6 bg-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-600">
        Create Free Account
      </button>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-10">
      <div class="max-w-7xl mx-auto px-6 text-center">
        © 2025 AI Learn. All rights reserved.
      </div>
    </footer>

  </div>
</template>

<script setup>
// This is a UI-only version
// You can later add:
// - Vue Router
// - Pinia
// - Auth logic (login/register)
// - API calls for AI study plans
</script>

<style>
/* Tailwind handles most styling */
</style>
