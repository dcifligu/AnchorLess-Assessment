<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('files', function (Blueprint $table) {
            $table->string('upload_type')->nullable()->after('type');
            $table->string('upload_session_id')->nullable()->after('upload_type');
            $table->integer('step_index')->nullable()->after('upload_session_id');
            $table->integer('file_index')->nullable()->after('step_index');
        });
    }

    public function down()
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['upload_type', 'upload_session_id', 'step_index', 'file_index']);
        });
    }
};
