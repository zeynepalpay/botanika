const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🌿 Botanika API',
            version: '2.0.0',
            description: 'Akıllı Bitki Bakımı ve Sulama Takip Sistemi API Dokümantasyonu (Gelişmiş Mimari)',
            contact: { name: 'Zeynep' }
        },
        servers: [{ url: 'http://localhost:3000' }],
        paths: {
            '/api/auth/register': {
                post: {
                    summary: 'Yeni kullanıcı kaydı oluşturur',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        kullanici_adi: { type: 'string' },
                                        sifre: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Kullanıcı başarıyla oluşturuldu' },
                        400: { description: 'Kullanıcı adı ve şifre zorunludur veya alınmıştır' }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    summary: 'Kullanıcı girişi yapar ve JWT Token döner',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        kullanici_adi: { type: 'string' },
                                        sifre: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Giriş başarılı, token döndürüldü' },
                        401: { description: 'Kullanıcı adı veya şifre hatalı' }
                    }
                }
            },
            '/api/plants': {
                get: {
                    summary: 'Giriş yapan kullanıcının tüm bitkilerini listeler',
                    responses: {
                        200: { description: 'Bitki listesi başarıyla getirildi' }
                    }
                },
                post: {
                    summary: 'Giriş yapan kullanıcıya yeni bir bitki ekler',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        isim: { type: 'string' },
                                        tur: { type: 'string' },
                                        aciklama: { type: 'string' },
                                        toprak_bakimi: { type: 'string' },
                                        ilaclama_notu: { type: 'string' },
                                        asilama_durumu: { type: 'string' },
                                        sulama_periyodu: { type: 'integer' },
                                        son_sulama_tarihi: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Bitki başarıyla eklendi' },
                        400: { description: 'Eksik veri veya geçersiz periyot' }
                    }
                }
            },
            '/api/plants/{id}': {
                put: {
                    summary: 'Bitki bilgilerini günceller',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla güncellendi' }
                    }
                },
                delete: {
                    summary: 'Sistemden bitki siler',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla silindi' }
                    }
                }
            },
            '/api/plants/{id}/water': {
                post: {
                    summary: 'Bitkiyi sular ve geçmişe kaydeder',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Bitki başarıyla sulandı' }
                    }
                }
            },
            '/api/plants/history/{logId}': {
                delete: {
                    summary: 'Yanlışlıkla eklenen sulama kaydını siler',
                    parameters: [{ in: 'path', name: 'logId', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Kayıt başarıyla silindi' },
                        404: { description: 'Kayıt bulunamadı' }
                    }
                }
            },
            '/api/plants/{id}/care': {
                put: {
                    summary: 'Bitki özel bakım tarihlerini (Toprak, İlaç, Aşı) günceller',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        careType: { type: 'string', example: 'ilac' },
                                        date: { type: 'string', example: '2026-05-19' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Bakım tarihi başarıyla güncellendi' },
                        400: { description: 'Geçersiz bakım tipi veya hatalı istek' },
                        404: { description: 'Bitki bulunamadı veya yetkiniz yok' }
                    }
                }
            }
        }
    },
    apis: [] // Artık kod dosyalarını taramayacak, hata riski SIFIR!
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerDocs
};