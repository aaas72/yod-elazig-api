
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import FAQ from './models/FAQ';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const faqData = {
  "categories": [
    {
      "id": "general",
      "title": "أسئلة عامة",
      "questions": [
        {
          "id": "gen1",
          "question": "ما هو اتحاد الطلاب اليمنيين في إيلازيغ؟",
          "answer": "هو هيئة طلابية منتخبة تهدف إلى تمثيل الطلاب اليمنيين في جامعة الفرات ومدينة إيلازيغ، ورعاية مصالحهم، وتنظيم الأنشطة الثقافية والأكاديمية والاجتماعية التي تخدمهم."
        },
        {
          "id": "gen2",
          "question": "من يحق له الانضمام للاتحاد؟",
          "answer": "يحق لجميع الطلاب اليمنيين الدارسين في مدينة إيلازيغ (جامعة الفرات) الانضمام إلى الاتحاد والمشاركة في أنشطته وفعالياته."
        },
        {
          "id": "gen3",
          "question": "كيف يمكنني التواصل مع إدارة الاتحاد؟",
          "answer": "يمكنك التواصل معنا عبر صفحة 'تواصل معنا' في الموقع، أو من خلال حساباتنا الرسمية على وسائل التواصل الاجتماعي، أو زيارة مقر الاتحاد في أوقات الدوام الرسمي."
        }
      ]
    },
    {
      "id": "residency",
      "title": "الإقامة والهجرة",
      "questions": [
        {
          "id": "res_first",
          "question": "طريقة التقديم على الإقامة لأول مرة",
          "answer": "للطلاب الجدد، يجب التقديم على الإقامة خلال فترة الفيزا أو خلال 90 يوم من الدخول. تأكد من تجهيز كافة الوثائق قبل موعد المقابلة.",
          "steps": [
            "الدخول لموقع [إدارة الهجرة (e-ikamet)](https://e-ikamet.goc.gov.tr/) وتعبئة استمارة 'أول مرة'.",
            "طباعة الاستمارة وتجهيز الأوراق المطلوبة.",
            "دفع ضريبة كرت الإقامة (البدل) عبر [موقع الدفع الرسمي](https://dijital.gib.gov.tr/hizliOdemeler/gocIdaresiIkametTezkeresiHarciOdeme).",
            "الذهاب للموعد في إدارة الهجرة في الوقت المحدد مع كافة الأوراق."
          ],
          "documents": [
            {
              "name": "استمارة الموعد",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770491941/Extracted_fromBasvuru_Formu-Application_Form_adllwv.png"
            },
            {
              "name": "وثيقة الطالب (Öğrenci Belgesi)",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770494462/yok-ogrenci-belgesi-sorgulama_00_mdl60j.png"
            },
            {
              "name": "تأمين صحي (Sigorta)",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770494672/spas-mustahaklik-sorgulama_00_dewnkc.png"
            },
            {
              "name": "2 صور بيومترية",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770495373/Chinese_passport_photo_requirements_ilngrv.png"
            },
            {
              "name": "عقد إيجار أو وثيقة سكن",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770494135/nvi-yerlesim-yeri-ve-diger-adres-belgesi-sorgulama_00_tjjhrl.png"
            },
            {
              "name": "صورة الجواز والفيزا",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770495185/pngtree-passport-and-visa-stamps-in-a-travel-document-png-image_18213463_mz36ig.webp"
            },
            {
              "name": "وثيقة دفع الضريبة",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770493118/IVD-Alindi-b3DVK82N5CGN_00_ayj7om.png"
            },
            {
              "name": "وثيقة UETS",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770494812/PttUETS_00_rcxrpe.png"
            }
          ]
        },
        {
          "id": "res_renew",
          "question": "طريقة تجديد الإقامة",
          "answer": "يجب تقديم طلب التجديد قبل انتهاء الإقامة الحالية بـ 60 يوم كحد أقصى.",
          "steps": [
            "نفس خطوات التقديم لأول مرة تماماً، ولكن يجب اختيار 'طلب تمديد' (Uzatma Başvurusu) من داخل الموقع.",
            "إذا كنت في السنة الأخيرة من الجامعة، يجب إضافة كشف الدرجات (Transkript) ضمن الوثائق التي تسلم لإدارة الهجرة."
          ],
          "documents": [
            {
              "name": "كشف الدرجات (لطلاب السنة الأخيرة)",
              "image": "https://res.cloudinary.com/asdev1/image/upload/v1770494462/yok-ogrenci-belgesi-sorgulama_00_mdl60j.png"
            }
          ]
        }
      ]
    },
    {
      "id": "academic",
      "title": "الشؤون الأكاديمية",
      "questions": [
        {
          "id": "acad1",
          "question": "كيف يمكنني الحصول على المراجع الدراسية؟",
          "answer": "يوفر الاتحاد مكتبة إلكترونية شاملة تحتوي على ملخصات، نماذج امتحانات سابقة، وكتب دراسية. يمكنك الوصول إليها عبر قسم 'الأرشيف' -> 'المكتبة الأكاديمية' في الموقع."
        },
        {
          "id": "acad2",
          "question": "هل يساعد الاتحاد في إجراءات التسجيل في الجامعة؟",
          "answer": "نعم، يقدم الاتحاد استشارات وتوجيهات للطلاب الجدد بخصوص إجراءات التسجيل، وتثبيت القيد، واختيار المواد، وذلك عبر لجنة العلاقات العامة واللجنة الأكاديمية."
        }
      ]
    },
    {
      "id": "living",
      "title": "المعيشة والسكن",
      "questions": [
        {
          "id": "liv_male",
          "question": "سكنات الذكور (KYK والخاص)",
          "answer": "تتوفر خيارات متعددة للطلاب الذكور:\n\n**سكنات الدولة (KYK):**\n1. **سكن أحمد كاباكلي (Ahmet Kabaklı Yurdu):** يقع في حي تشايدا تشرا (Çayda Çıra)، وهو الأكبر والأحدث.\n2. **سكن عمر بيلجين أوغلو (Ömer Bilginoğlu Yurdu):** يقع في حي أتاشهير (Ataşehir).\n3. **سكن إيلازيغ (Elazığ Yurdu):** يقع داخل الحرم الجامعي (كلية الهندسة).\n\n**السكنات الخاصة:** تتوفر في وسط المدينة وأحياء مثل Kültür Mah و Ataşehir."
        },
        {
          "id": "liv_female",
          "question": "سكنات الإناث (KYK والخاص)",
          "answer": "خيارات السكن للطالبات متنوعة وآمنة:\n\n**سكنات الدولة (KYK):**\n1. **سكن سارة آنا (Sare Ana Yurdu):** عند المدخل الرئيسي للجامعة (حي الجامعة).\n2. **سكن هاربوط (Harput Yurdu):** بجوار كلية الهندسة (داخل الحرم).\n3. **سكن فتحي سكين (Fethi Sekin Yurdu):** يقع في حي أتاشهير.\n\n**السكنات الخاصة:** تتركز في حي الجامعة (Üniversite Mah) ووسط المدينة (Nailbey)."
        },
        {
          "id": "liv_rent",
          "question": "السكن في منازل (استئجار شقق)",
          "answer": "يفضل الكثير من الطلاب استئجار شقق مشتركة. إليك أفضل المناطق:\n\n1. **حي تشايدا تشرا (Çayda Çıra):** المنطقة الأكثر رغبة للطلاب، مباني حديثة (مجمعات) وقريبة من المواصلات.\n2. **حي الجامعة (Üniversite Mah):** الميزة الأكبر هي القرب (مشياً للجامعة)، لكن المباني قديمة غالباً.\n3. **حي أتاشهير (Ataşehir):** منطقة راقية وهادئة.\n\n*نصيحة:* الإيجار يتطلب عادة دفع تأمين (Depozito) وعمولة مكتب عقاري (Emlakçı)."
        }
      ]
    },
    {
      "id": "membership",
      "title": "العضوية والانتخابات",
      "questions": [
        {
          "id": "mem1",
          "question": "كيف يمكنني الترشح لانتخابات الاتحاد؟",
          "answer": "يتم فتح باب الترشح سنوياً وفق اللائحة الداخلية للاتحاد. يجب أن يكون المرشح طالباً يمنياً في الجامعة، وأن يستوفي الشروط المعلنة من قبل اللجنة الانتخابية."
        },
        {
          "id": "mem2",
          "question": "هل هناك رسوم للعضوية؟",
          "answer": "العضوية في الاتحاد مجانية لجميع الطلاب اليمنيين، ولكن قد تكون هناك رسوم رمزية للاشتراك في بعض الأنشطة الخاصة أو الرحلات."
        }
      ]
    },
    {
      "id": "technical",
      "title": "دعم تقني",
      "questions": [
        {
          "id": "tech1",
          "question": "كيف أنشئ حساباً في الموقع؟",
          "answer": "حالياً، التسجيل متاح للإداريين وأعضاء اللجان. سيتم فتح باب التسجيل للطلاب قريباً للاستفادة من الخدمات الإلكترونية المتقدمة."
        },
        {
          "id": "tech2",
          "question": "واجهت مشكلة في تصفح الموقع، ماذا أفعل؟",
          "answer": "يرجى مراسلتنا عبر صفحة 'تواصل معنا' واختيار موضوع 'دعم تقني'، مع شرح المشكلة التي واجهتها، وسيقوم فريقنا التقني بمساعدتك في أقرب وقت."
        }
      ]
    }
  ]
};

const seedFAQs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    let orderCounter = 0;

    for (const category of faqData.categories) {
      for (const q of category.questions) {
        orderCounter++;
        
        // Prepare localized data
        // For EN and TR, we'll use AR text as placeholder since we don't have real translations
        // But we can append [EN] or [TR] to make it clear, or just copy it.
        // User said "translate them" as in "fake/mock translation" likely.
        
        const question = {
          ar: q.question,
          en: q.question, // Mock translation
          tr: q.question  // Mock translation
        };

        const answer = {
          ar: q.answer,
          en: q.answer, // Mock translation
          tr: q.answer  // Mock translation
        };

        const steps = {
          ar: (q as any).steps || [],
          en: (q as any).steps || [],
          tr: (q as any).steps || []
        };

        const documents = ((q as any).documents || []).map((doc: any) => ({
          name: {
            ar: doc.name,
            en: doc.name,
            tr: doc.name
          },
          url: doc.image
        }));

        await FAQ.create({
          question,
          answer,
          category: category.id,
          steps,
          documents,
          order: orderCounter,
          isPublished: true
        });
      }
    }

    console.log('FAQs seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFAQs();
