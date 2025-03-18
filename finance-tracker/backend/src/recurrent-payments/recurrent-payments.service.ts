import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurrentPaymentDto, RecurrenceInterval } from './dto/create-recurrent-payment.dto';
import { UpdateRecurrentPaymentDto } from './dto/update-recurrent-payment.dto';

@Injectable()
export class RecurrentPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createRecurrentPaymentDto: CreateRecurrentPaymentDto) {
    // Calcola la prossima data di pagamento
    const nextPaymentDate = this.calculateNextPaymentDate(
      createRecurrentPaymentDto.startDate,
      createRecurrentPaymentDto.interval,
      createRecurrentPaymentDto.dayOfMonth,
      createRecurrentPaymentDto.dayOfWeek
    );

    // Crea il pagamento ricorrente
    const recurrentPayment = await this.prisma.recurrentPayment.create({
      data: {
        name: createRecurrentPaymentDto.name,
        amount: createRecurrentPaymentDto.amount,
        description: createRecurrentPaymentDto.description,
        interval: createRecurrentPaymentDto.interval,
        dayOfMonth: createRecurrentPaymentDto.dayOfMonth,
        dayOfWeek: createRecurrentPaymentDto.dayOfWeek,
        startDate: createRecurrentPaymentDto.startDate,
        endDate: createRecurrentPaymentDto.endDate,
        nextPaymentDate,
        isActive: createRecurrentPaymentDto.isActive ?? true,
        user: {
          connect: { id: userId },
        },
        category: {
          connect: { id: createRecurrentPaymentDto.categoryId },
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return recurrentPayment;
  }

  async findAll(userId: string) {
    return this.prisma.recurrentPayment.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.recurrentPayment.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  async update(id: string, updateRecurrentPaymentDto: UpdateRecurrentPaymentDto) {
    // Se l'intervallo o le date sono cambiate, ricalcola la prossima data di pagamento
    let nextPaymentDate;

    const currentPayment = await this.prisma.recurrentPayment.findUnique({
      where: { id },
    });

    if (
      updateRecurrentPaymentDto.interval !== undefined ||
      updateRecurrentPaymentDto.startDate !== undefined ||
      updateRecurrentPaymentDto.dayOfMonth !== undefined ||
      updateRecurrentPaymentDto.dayOfWeek !== undefined
    ) {
      const interval = updateRecurrentPaymentDto.interval || currentPayment.interval;
      const startDate = updateRecurrentPaymentDto.startDate || currentPayment.startDate;
      const dayOfMonth = updateRecurrentPaymentDto.dayOfMonth !== undefined
        ? updateRecurrentPaymentDto.dayOfMonth
        : currentPayment.dayOfMonth;
      const dayOfWeek = updateRecurrentPaymentDto.dayOfWeek !== undefined
        ? updateRecurrentPaymentDto.dayOfWeek
        : currentPayment.dayOfWeek;

      nextPaymentDate = this.calculateNextPaymentDate(startDate, interval, dayOfMonth, dayOfWeek);
    }

    // Aggiorna il pagamento ricorrente
    return this.prisma.recurrentPayment.update({
      where: { id },
      data: {
        name: updateRecurrentPaymentDto.name,
        amount: updateRecurrentPaymentDto.amount,
        description: updateRecurrentPaymentDto.description,
        interval: updateRecurrentPaymentDto.interval,
        dayOfMonth: updateRecurrentPaymentDto.dayOfMonth,
        dayOfWeek: updateRecurrentPaymentDto.dayOfWeek,
        startDate: updateRecurrentPaymentDto.startDate,
        endDate: updateRecurrentPaymentDto.endDate,
        nextPaymentDate: nextPaymentDate,
        isActive: updateRecurrentPaymentDto.isActive,
        categoryId: updateRecurrentPaymentDto.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.prisma.recurrentPayment.delete({
      where: { id },
    });

    return { id };
  }

  // Helper method to calculate the next payment date
  private calculateNextPaymentDate(
    startDate: Date,
    interval: string,
    dayOfMonth?: number,
    dayOfWeek?: number,
  ): Date {
    const today = new Date();
    let nextPaymentDate = new Date(startDate);

    // Se la data di inizio è nel futuro, quella è la prossima data di pagamento
    if (nextPaymentDate > today) {
      return nextPaymentDate;
    }

    // Altrimenti calcola la prossima data di pagamento in base all'intervallo
    switch (interval) {
      case RecurrenceInterval.DAILY:
        // La prossima data è semplicemente domani
        nextPaymentDate = new Date(today);
        nextPaymentDate.setDate(today.getDate() + 1);
        break;

      case RecurrenceInterval.WEEKLY:
        // Trova il prossimo giorno della settimana corrispondente
        if (dayOfWeek !== undefined) {
          nextPaymentDate = new Date(today);
          const currentDayOfWeek = today.getDay(); // 0 = domenica, 1 = lunedì, ecc.

          // Calcola quanti giorni mancano al prossimo giorno della settimana specificato
          let daysToAdd = dayOfWeek - currentDayOfWeek;
          if (daysToAdd <= 0) {
            // Se il giorno è già passato questa settimana, vai alla prossima
            daysToAdd += 7;
          }

          nextPaymentDate.setDate(today.getDate() + daysToAdd);
        } else {
          // Se non è specificato il giorno, aggiungi 7 giorni alla data corrente
          nextPaymentDate = new Date(today);
          nextPaymentDate.setDate(today.getDate() + 7);
        }
        break;

      case RecurrenceInterval.MONTHLY:
        // Trova il prossimo giorno del mese corrispondente
        if (dayOfMonth !== undefined) {
          let nextMonth = today.getMonth();
          let nextYear = today.getFullYear();

          // Se il giorno del mese è già passato per questo mese, vai al prossimo
          if (today.getDate() > dayOfMonth) {
            nextMonth++;
          }

          // Gestisci il passaggio d'anno
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
          }

          nextPaymentDate = new Date(nextYear, nextMonth, dayOfMonth);
        } else {
          // Se non è specificato il giorno, aggiungi un mese alla data corrente
          nextPaymentDate = new Date(today);
          nextPaymentDate.setMonth(today.getMonth() + 1);
        }
        break;

      case RecurrenceInterval.YEARLY:
        // Aggiungi un anno alla data corrente
        nextPaymentDate = new Date(today);
        nextPaymentDate.setFullYear(today.getFullYear() + 1);
        break;

      default:
        // Per sicurezza, se l'intervallo non è riconosciuto, usa la data di inizio
        break;
    }

    return nextPaymentDate;
  }
} 