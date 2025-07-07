<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class FileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_can_upload_valid_file(): void
    {
        $file = UploadedFile::fake()->image('test.jpg', 100, 100)->size(1000);

        $response = $this->postJson('/api/files', [
            'file' => $file,
        ]);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'id', 'filename', 'original_name', 'type', 'size', 'path'
                ]);

        $this->assertDatabaseHas('files', [
            'original_name' => 'test.jpg',
        ]);

        Storage::assertExists('uploads/' . $response->json('filename'));
    }

    public function test_rejects_invalid_file_type(): void
    {
        $file = UploadedFile::fake()->create('test.txt', 100);

        $response = $this->postJson('/api/files', [
            'file' => $file,
        ]);

        $response->assertStatus(422);
    }

    public function test_rejects_oversized_file(): void
    {
        $file = UploadedFile::fake()->image('large.jpg')->size(5000); // 5MB

        $response = $this->postJson('/api/files', [
            'file' => $file,
        ]);

        $response->assertStatus(422);
    }

    public function test_can_list_files_grouped_by_type(): void
    {
        File::factory()->create(['type' => 'image/jpeg']);
        File::factory()->create(['type' => 'application/pdf']);

        $response = $this->getJson('/api/files');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'images', 'pdfs', 'others'
                ]);
    }

    public function test_can_delete_file(): void
    {
        $file = File::factory()->create();
        Storage::put($file->path, 'test content');

        $response = $this->deleteJson("/api/files/{$file->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'File deleted successfully'
                ]);

        $this->assertDatabaseMissing('files', ['id' => $file->id]);
        Storage::assertMissing($file->path);
    }
}
