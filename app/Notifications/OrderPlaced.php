<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Number;

class OrderPlaced extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Order $order)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject(__('Order :number confirmed', ['number' => $this->order->number]))
            ->greeting(__('Thank you, :name!', ['name' => $this->order->customer_name]))
            ->line(__('We received your order :number and will let you know when it ships.', ['number' => $this->order->number]));

        foreach ($this->order->items as $item) {
            $message->line("{$item->quantity} × {$item->product_name}".($item->color ? " ({$item->color})" : ''));
        }

        return $message
            ->line(__('Total: :total', ['total' => Number::currency((float) $this->order->total, $this->order->currency)]))
            ->line(__('Payment method: :method', ['method' => $this->order->payment_method->label()]))
            ->action(__('View order'), route('account.orders.show', $this->order));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'number' => $this->order->number,
        ];
    }
}
