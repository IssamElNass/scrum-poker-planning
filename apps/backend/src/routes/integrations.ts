import { Router, Request, Response } from 'express';
import * as integrationsRepo from '../repositories/integrations';
import { encrypt, decrypt } from '../lib/encryption';

const router = Router();

// Get integrations for a room
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const integrations = await integrationsRepo.getIntegrationsByRoom(roomId);
    
    res.json({ success: true, data: integrations });
  } catch (error) {
    console.error('Failed to get integrations:', error);
    res.status(500).json({ success: false, error: 'Failed to get integrations' });
  }
});

// Create integration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roomId, type, credentials, config } = req.body;
    
    // Encrypt credentials before storing
    const encryptedCredentials = await encrypt(JSON.stringify(credentials));

    const integration = await integrationsRepo.createIntegration({
      roomId,
      type,
      encryptedCredentials,
      config,
    });

    res.json({ success: true, data: integration });
  } catch (error) {
    console.error('Failed to create integration:', error);
    res.status(500).json({ success: false, error: 'Failed to create integration' });
  }
});

// Update integration
router.patch('/:integrationId', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const { credentials, config } = req.body;

    const updates: integrationsRepo.UpdateIntegrationData = {};

    if (credentials) {
      updates.encryptedCredentials = await encrypt(JSON.stringify(credentials));
    }

    if (config) {
      updates.config = config;
    }

    const integration = await integrationsRepo.updateIntegration(
      integrationId,
      updates
    );

    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }

    res.json({ success: true, data: integration });
  } catch (error) {
    console.error('Failed to update integration:', error);
    res.status(500).json({ success: false, error: 'Failed to update integration' });
  }
});

// Delete integration
router.delete('/:integrationId', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    
    const deleted = await integrationsRepo.deleteIntegration(integrationId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete integration:', error);
    res.status(500).json({ success: false, error: 'Failed to delete integration' });
  }
});

// Get decrypted credentials (use with caution)
router.get('/:integrationId/credentials', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    
    const integration = await integrationsRepo.getIntegrationById(integrationId);
    
    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }
    
    const decryptedCredentials = await decrypt(integration.encryptedCredentials);
    const credentials = JSON.parse(decryptedCredentials);

    res.json({ success: true, data: credentials });
  } catch (error) {
    console.error('Failed to get credentials:', error);
    res.status(500).json({ success: false, error: 'Failed to get credentials' });
  }
});

export default router;

