from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer
from django.utils import timezone


class ServiceTicket(models.Model):
    """客服工單"""

    PRIORITY_CHOICES = [
        ("low", "低"),
        ("medium", "中"),
        ("high", "高"),
        ("urgent", "緊急"),
    ]

    STATUS_CHOICES = [
        ("open", "開啟中"),
        ("in_progress", "處理中"),
        ("pending", "等待回應"),
        ("resolved", "已解決"),
        ("closed", "已關閉"),
    ]

    CATEGORY_CHOICES = [
        ("general", "一般諮詢"),
        ("technical", "技術問題"),
        ("billing", "計費問題"),
        ("product", "產品問題"),
        ("shipping", "物流問題"),
        ("return", "退換貨"),
        ("complaint", "客訴"),
        ("feature_request", "功能建議"),
    ]

    # 基本資訊
    ticket_number = models.CharField(
        max_length=20, unique=True, verbose_name="工單號碼"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="service_tickets",
        verbose_name="客戶",
    )
    title = models.CharField(max_length=200, verbose_name="工單標題")
    description = models.TextField(verbose_name="問題描述")

    # 分類和優先級
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="general",
        verbose_name="問題分類",
    )
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="medium", verbose_name="優先級"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="open", verbose_name="狀態"
    )

    # 處理資訊
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
        verbose_name="負責人員",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_tickets",
        verbose_name="建立人員",
    )

    # 時間記錄
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")
    first_response_at = models.DateTimeField(
        null=True, blank=True, verbose_name="首次回應時間"
    )
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="解決時間")
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="關閉時間")

    # 其他資訊
    tags = models.JSONField(default=list, blank=True, verbose_name="標籤")
    satisfaction_rating = models.IntegerField(
        null=True, blank=True, verbose_name="滿意度評分", help_text="1-5分"
    )
    satisfaction_comment = models.TextField(blank=True, verbose_name="滿意度評語")

    class Meta:
        verbose_name = "客服工單"
        verbose_name_plural = "客服工單"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            # 生成工單號碼：CS + 年月日 + 4位序號
            from django.db.models import Max

            today = timezone.now().strftime("%Y%m%d")
            prefix = f"CS{today}"

            last_ticket = ServiceTicket.objects.filter(
                ticket_number__startswith=prefix
            ).aggregate(Max("ticket_number"))

            if last_ticket["ticket_number__max"]:
                last_number = int(last_ticket["ticket_number__max"][-4:])
                new_number = last_number + 1
            else:
                new_number = 1

            self.ticket_number = f"{prefix}{new_number:04d}"

        super().save(*args, **kwargs)

    @property
    def response_time(self):
        """首次回應時間"""
        if self.first_response_at:
            return self.first_response_at - self.created_at
        return None

    @property
    def resolution_time(self):
        """解決時間"""
        if self.resolved_at:
            return self.resolved_at - self.created_at
        return None


class ServiceNote(models.Model):
    """客服記錄 記錄每個客服工單的詳細互動歷史"""

    NOTE_TYPE_CHOICES = [
        ("internal", "內部備註"),
        ("customer", "客戶回應"),
        ("system", "系統記錄"),
        ("resolution", "解決方案"),
    ]

    ticket = models.ForeignKey(
        ServiceTicket,
        on_delete=models.CASCADE,
        related_name="notes",
        verbose_name="工單",
    )
    content = models.TextField(verbose_name="記錄內容")
    note_type = models.CharField(
        max_length=20,
        choices=NOTE_TYPE_CHOICES,
        default="internal",
        verbose_name="記錄類型",
    )

    # 作者資訊
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name="記錄人員"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="記錄時間")

    # 額外資訊
    is_visible_to_customer = models.BooleanField(default=False, verbose_name="客戶可見")
    attachments = models.JSONField(default=list, blank=True, verbose_name="附件")

    class Meta:
        verbose_name = "客服記錄"
        verbose_name_plural = "客服記錄"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.ticket.ticket_number} - {self.get_note_type_display()}"


class KnowledgeBaseCategory(models.Model):
    """知識庫分類"""

    name = models.CharField(max_length=100, verbose_name="分類名稱")
    description = models.TextField(blank=True, verbose_name="分類描述")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name="上級分類",
    )
    sort_order = models.IntegerField(default=0, verbose_name="排序")
    is_active = models.BooleanField(default=True, verbose_name="是否啟用")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")

    class Meta:
        verbose_name = "知識庫分類"
        verbose_name_plural = "知識庫分類"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class KnowledgeBase(models.Model):
    """知識庫文章"""

    CONTENT_TYPE_CHOICES = [
        ("faq", "FAQ"),
        ("guide", "操作指南"),
        ("policy", "政策說明"),
        ("troubleshooting", "故障排除"),
        ("sop", "SOP 標準作業程序"),
    ]

    title = models.CharField(max_length=200, verbose_name="標題")
    content = models.TextField(verbose_name="內容")
    summary = models.CharField(max_length=500, blank=True, verbose_name="摘要")

    # 分類和標籤
    category = models.ForeignKey(
        KnowledgeBaseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="分類",
    )
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        default="faq",
        verbose_name="內容類型",
    )
    tags = models.JSONField(default=list, blank=True, verbose_name="標籤")

    # 權限和狀態
    is_public = models.BooleanField(default=True, verbose_name="公開可見")
    is_featured = models.BooleanField(default=False, verbose_name="精選文章")
    is_active = models.BooleanField(default=True, verbose_name="是否啟用")

    # 作者和時間
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="knowledge_articles",
        verbose_name="建立人員",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="updated_knowledge_articles",
        verbose_name="更新人員",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")

    # 統計資訊
    view_count = models.IntegerField(default=0, verbose_name="查看次數")
    helpful_count = models.IntegerField(default=0, verbose_name="有用次數")
    not_helpful_count = models.IntegerField(default=0, verbose_name="無用次數")

    class Meta:
        verbose_name = "知識庫文章"
        verbose_name_plural = "知識庫文章"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title

    @property
    def helpfulness_ratio(self):
        """有用性比率"""
        total_feedback = self.helpful_count + self.not_helpful_count
        if total_feedback > 0:
            return (self.helpful_count / total_feedback) * 100
        return 0


class FAQ(models.Model):
    """常見問題"""

    question = models.CharField(max_length=300, verbose_name="問題")
    answer = models.TextField(verbose_name="答案")
    category = models.ForeignKey(
        KnowledgeBaseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="分類",
    )

    # 狀態和排序
    is_active = models.BooleanField(default=True, verbose_name="是否啟用")
    is_featured = models.BooleanField(default=False, verbose_name="是否置頂")
    sort_order = models.IntegerField(default=0, verbose_name="排序")

    # 統計資訊
    view_count = models.IntegerField(default=0, verbose_name="查看次數")

    # 時間記錄
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name="建立人員"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")

    class Meta:
        verbose_name = "常見問題"
        verbose_name_plural = "常見問題"
        ordering = ["-is_featured", "sort_order", "question"]

    def __str__(self):
        return self.question
