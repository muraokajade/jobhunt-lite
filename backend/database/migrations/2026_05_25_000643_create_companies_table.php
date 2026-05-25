<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * companiesテーブルを作成する処理
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();

            // ログインユーザーID
            // nullable() にしておくことで、認証未実装の段階でもデータ登録できる
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // 企業名
            $table->string('name');

            // 応募媒体
            $table->string('media')->nullable();

            // 優先度
            $table->string('priority')->nullable();

            // 応募ステータス
            $table->string('status')->default('応募済み');

            // 応募日
            $table->date('applied_date')->nullable();

            // 面談・面接日時
            $table->dateTime('interview_date')->nullable();

            // 求人URL
            $table->text('job_url')->nullable();

            // 面接URL
            $table->text('interview_url')->nullable();

            // メモ
            $table->text('memo')->nullable();

            // 次にやること
            $table->string('next_action')->nullable();

            // 書類選考結果
            $table->string('document_result')->nullable();

            // 一次面接結果
            $table->string('first_interview_result')->nullable();

            // 二次面接結果
            $table->string('second_interview_result')->nullable();

            // 最終面接結果
            $table->string('final_result')->nullable();

            // 落選ステージ
            $table->string('rejection_stage')->nullable();

            // お気に入り
            $table->boolean('is_favorite')->default(false);

            // created_at / updated_at
            $table->timestamps();
        });
    }

    /**
     * companiesテーブルを削除する処理
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
