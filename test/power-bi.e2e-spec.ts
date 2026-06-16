import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('PowerBi (e2e)', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /power-bi/tables (200 OK and whitelisted tables schema)', () => {
        return request(app.getHttpServer())
            .get('/power-bi/tables')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                const tableNames = res.body.map((t: any) => t.name);
                expect(tableNames).toContain('MDA');
                expect(tableNames).toContain('Project');
                expect(tableNames).not.toContain('User');
            });
    });

    it('GET /power-bi/tables/MDA/sample (200 OK and sample records array)', () => {
        return request(app.getHttpServer())
            .get('/power-bi/tables/MDA/sample')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeLessThanOrEqual(10);
                if (res.body.length > 0) {
                    const keys = Object.keys(res.body[0]);
                    expect(keys).toContain('id');
                    expect(keys).toContain('name');
                    expect(keys).not.toContain('passwordHash');
                }
            });
    });

    it('GET /power-bi/tables/MDA/export (200 OK with CSV format and download headers)', () => {
        return request(app.getHttpServer())
            .get('/power-bi/tables/MDA/export')
            .expect(200)
            .expect('Content-Type', /text\/csv/)
            .expect('Content-Disposition', /attachment; filename="mda-sample.csv"/)
            .expect((res) => {
                expect(typeof res.text).toBe('string');
                expect(res.text).toContain('id,name,code,createdAt,updatedAt');
            });
    });

    it('GET /power-bi/tables/User/sample (404 Not Found for non-whitelisted table)', () => {
        return request(app.getHttpServer())
            .get('/power-bi/tables/User/sample')
            .expect(404);
    });

    it('GET /power-bi/tables/InvalidTable/sample (404 Not Found for invalid table)', () => {
        return request(app.getHttpServer())
            .get('/power-bi/tables/InvalidTable/sample')
            .expect(404);
    });
});
