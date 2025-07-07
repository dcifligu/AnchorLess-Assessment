<?php

namespace Database\Factories;

use App\Models\File;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\File>
 */
class FileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = File::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'filename' => $this->faker->uuid() . '.jpg',
            'original_name' => $this->faker->word() . '.jpg',
            'type' => 'image/jpeg',
            'size' => $this->faker->numberBetween(1000, 1000000),
            'path' => 'uploads/' . $this->faker->uuid() . '.jpg',
        ];
    }

    /**
     * Indicate that the file is a PDF.
     */
    public function pdf(): static
    {
        return $this->state(fn (array $attributes) => [
            'filename' => $this->faker->uuid() . '.pdf',
            'original_name' => $this->faker->word() . '.pdf',
            'type' => 'application/pdf',
        ]);
    }
}
